// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title DelegationManager
 * @dev ERC-7715 compliant delegation management contract
 * Implements hierarchical delegation chains with custom caveats
 * Deployed on Ethereum Sepolia Testnet for DelegateFlow Hackathon
 */

interface IDelegationManager {
    event DelegationCreated(
        bytes32 indexed delegationId,
        address indexed delegator,
        address indexed delegate,
        bytes32 authority
    );
    event DelegationRevoked(bytes32 indexed delegationId);
    event DelegationRedeemed(
        bytes32 indexed delegationId,
        address indexed redeemer,
        bytes callData
    );
    event CaveatEnforced(bytes32 indexed delegationId, address indexed enforcer);

    struct Caveat {
        address enforcer;
        bytes terms;
        bytes args;
    }

    struct Delegation {
        address delegator;
        address delegate;
        bytes32 authority;
        Caveat[] caveats;
        bytes32 salt;
        uint256 createdAt;
        uint256 expiresAt;
        bool revoked;
    }

    function createDelegation(
        address delegator,
        address delegate,
        bytes32 authority,
        Caveat[] calldata caveats,
        bytes32 salt,
        uint256 expiresAt
    ) external returns (bytes32);

    function revokeDelegation(bytes32 delegationId) external;

    function redeemDelegation(
        bytes32 delegationId,
        address target,
        bytes calldata callData
    ) external payable returns (bytes memory);

    function validateCaveats(bytes32 delegationId, bytes calldata context)
        external
        view
        returns (bool);

    function getDelegation(bytes32 delegationId)
        external
        view
        returns (
            address delegator,
            address delegate,
            bytes32 authority,
            bytes32 salt,
            uint256 createdAt,
            uint256 expiresAt,
            bool revoked
        );

    function getSubDelegations(bytes32 parentId)
        external
        view
        returns (bytes32[] memory);
}

contract DelegationManager is IDelegationManager {
    // --- State ---
    struct StoredDelegation {
        address delegator;
        address delegate;
        bytes32 authority;
        bytes32 salt;
        uint256 createdAt;
        uint256 expiresAt;
        bool revoked;
    }

    mapping(bytes32 => StoredDelegation) public storedDelegations;
    mapping(bytes32 => IDelegationManager.Caveat[]) public delegationCaveats;
    mapping(bytes32 => bytes32[]) public subDelegations;

    uint256 public totalDelegations;

    // --- Core Functions ---

    function createDelegation(
        address delegator,
        address delegate,
        bytes32 authority,
        IDelegationManager.Caveat[] calldata caveats,
        bytes32 salt,
        uint256 expiresAt
    ) external returns (bytes32) {
        bytes32 delegationId = keccak256(
            abi.encodePacked(delegator, delegate, salt, block.chainid)
        );

        require(
            storedDelegations[delegationId].delegator == address(0),
            "Delegation already exists"
        );

        // Store delegation
        storedDelegations[delegationId] = StoredDelegation({
            delegator: delegator,
            delegate: delegate,
            authority: authority,
            salt: salt,
            createdAt: block.timestamp,
            expiresAt: expiresAt,
            revoked: false
        });

        // Store caveats separately to avoid storage overwrite bug
        for (uint256 i = 0; i < caveats.length; i++) {
            delegationCaveats[delegationId].push(caveats[i]);
        }

        // Link sub-delegation to parent
        if (authority != bytes32(0)) {
            subDelegations[authority].push(delegationId);
        }

        totalDelegations++;
        emit DelegationCreated(delegationId, delegator, delegate, authority);
        return delegationId;
    }

    function revokeDelegation(bytes32 delegationId) external {
        StoredDelegation storage del = storedDelegations[delegationId];
        require(del.delegator == msg.sender, "Only delegator can revoke");
        require(!del.revoked, "Already revoked");
        del.revoked = true;
        emit DelegationRevoked(delegationId);
    }

    function redeemDelegation(
        bytes32 delegationId,
        address target,
        bytes calldata callData
    ) external payable returns (bytes memory) {
        StoredDelegation storage del = storedDelegations[delegationId];
        require(del.delegator != address(0), "Delegation does not exist");
        require(!del.revoked, "Delegation revoked");
        require(block.timestamp <= del.expiresAt, "Delegation expired");
        require(del.delegate == msg.sender, "Only delegate can redeem");

        // Enforce all caveats
        IDelegationManager.Caveat[] storage caveats = delegationCaveats[delegationId];
        for (uint256 i = 0; i < caveats.length; i++) {
            _enforceCaveat(delegationId, caveats[i], callData);
        }

        // Execute the delegated call
        (bool success, bytes memory result) = target.call{value: msg.value}(callData);
        require(success, "Delegated call failed");

        emit DelegationRedeemed(delegationId, msg.sender, callData);
        return result;
    }

    function validateCaveats(bytes32 delegationId, bytes calldata /*context*/)
        external
        view
        returns (bool)
    {
        StoredDelegation storage del = storedDelegations[delegationId];
        if (del.revoked) return false;
        if (block.timestamp > del.expiresAt) return false;
        return true;
    }

    function getDelegation(bytes32 delegationId)
        external
        view
        returns (
            address delegator,
            address delegate,
            bytes32 authority,
            bytes32 salt,
            uint256 createdAt,
            uint256 expiresAt,
            bool revoked
        )
    {
        StoredDelegation storage del = storedDelegations[delegationId];
        return (
            del.delegator,
            del.delegate,
            del.authority,
            del.salt,
            del.createdAt,
            del.expiresAt,
            del.revoked
        );
    }

    function getSubDelegations(bytes32 parentId)
        external
        view
        returns (bytes32[] memory)
    {
        return subDelegations[parentId];
    }

    function getCaveats(bytes32 delegationId)
        external
        view
        returns (IDelegationManager.Caveat[] memory)
    {
        return delegationCaveats[delegationId];
    }

    // --- Internal ---

    function _enforceCaveat(
        bytes32 delegationId,
        IDelegationManager.Caveat storage caveat,
        bytes calldata callData
    ) internal {
        if (caveat.enforcer == address(0)) return; // Skip null enforcers
        (bool success, ) = caveat.enforcer.staticcall(
            abi.encodeWithSignature(
                "enforceCaveat(bytes32,bytes,bytes)",
                delegationId,
                caveat.terms,
                callData
            )
        );
        require(success, "Caveat enforcement failed");
        emit CaveatEnforced(delegationId, caveat.enforcer);
    }
}
