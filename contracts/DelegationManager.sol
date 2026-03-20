// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title DelegationManager
 * @dev ERC-7715 compliant delegation management contract
 * Implements hierarchical delegation chains with custom caveats
 */

interface IDelegationManager {
    // Events
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

    // Structs
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

    // Functions
    /**
     * @dev Create a new delegation
     * @param delegator The original grantor of authority
     * @param delegate The recipient of delegated authority
     * @param authority Reference to parent delegation (0x0 for root)
     * @param caveats Array of permission constraints
     * @param salt Unique identifier for delegation
     * @param expiresAt Expiration timestamp
     * @return delegationId The unique ID of created delegation
     */
    function createDelegation(
        address delegator,
        address delegate,
        bytes32 authority,
        Caveat[] calldata caveats,
        bytes32 salt,
        uint256 expiresAt
    ) external returns (bytes32);

    /**
     * @dev Revoke an active delegation
     * @param delegationId ID of delegation to revoke
     */
    function revokeDelegation(bytes32 delegationId) external;

    /**
     * @dev Redeem a delegation to execute an action
     * @param delegationId ID of delegation being used
     * @param target Contract to call
     * @param callData Function and parameters to execute
     * @return result Return data from executed call
     */
    function redeemDelegation(
        bytes32 delegationId,
        address target,
        bytes calldata callData
    ) external payable returns (bytes memory);

    /**
     * @dev Validate all caveats for a delegation
     * @param delegationId ID of delegation to validate
     * @param context Additional context for validation
     * @return valid True if all caveats are satisfied
     */
    function validateCaveats(bytes32 delegationId, bytes calldata context)
        external
        view
        returns (bool);

    /**
     * @dev Get delegation details
     * @param delegationId ID of delegation
     * @return delegation The delegation struct
     */
    function getDelegation(bytes32 delegationId)
        external
        view
        returns (Delegation memory);

    /**
     * @dev Get sub-delegations under a parent
     * @param parentId Parent delegation ID
     * @return subDelegations Array of sub-delegation IDs
     */
    function getSubDelegations(bytes32 parentId)
        external
        view
        returns (bytes32[] memory);
}

// Simple reference implementation
contract DelegationManager is IDelegationManager {
    mapping(bytes32 => Delegation) public delegations;
    mapping(bytes32 => bytes32[]) public subDelegations;

    function createDelegation(
        address delegator,
        address delegate,
        bytes32 authority,
        Caveat[] calldata caveats,
        bytes32 salt,
        uint256 expiresAt
    ) external returns (bytes32) {
        bytes32 delegationId = keccak256(
            abi.encodePacked(delegator, delegate, salt, block.chainid)
        );

        require(
            delegations[delegationId].delegator == address(0),
            "Delegation exists"
        );

        Caveat[] storage newCaveats = delegations[delegationId].caveats;
        for (uint256 i = 0; i < caveats.length; i++) {
            newCaveats.push(caveats[i]);
        }

        delegations[delegationId] = Delegation({
            delegator: delegator,
            delegate: delegate,
            authority: authority,
            salt: salt,
            createdAt: block.timestamp,
            expiresAt: expiresAt,
            revoked: false
        });

        if (authority != bytes32(0)) {
            subDelegations[authority].push(delegationId);
        }

        emit DelegationCreated(delegationId, delegator, delegate, authority);
        return delegationId;
    }

    function revokeDelegation(bytes32 delegationId) external {
        Delegation storage del = delegations[delegationId];
        require(del.delegator == msg.sender, "Not delegator");
        require(!del.revoked, "Already revoked");
        del.revoked = true;
        emit DelegationRevoked(delegationId);
    }

    function redeemDelegation(
        bytes32 delegationId,
        address target,
        bytes calldata callData
    ) external payable returns (bytes memory) {
        Delegation storage del = delegations[delegationId];
        require(!del.revoked, "Revoked");
        require(block.timestamp <= del.expiresAt, "Expired");
        require(del.delegate == msg.sender, "Not delegate");

        // Validate caveats
        for (uint256 i = 0; i < del.caveats.length; i++) {
            _enforceCaveat(delegationId, del.caveats[i], callData);
        }

        // Execute call
        (bool success, bytes memory result) = target.call{value: msg.value}(
            callData
        );
        require(success, "Call failed");

        emit DelegationRedeemed(delegationId, msg.sender, callData);
        return result;
    }

    function validateCaveats(bytes32 delegationId, bytes calldata context)
        external
        view
        returns (bool)
    {
        Delegation storage del = delegations[delegationId];
        for (uint256 i = 0; i < del.caveats.length; i++) {
            // Simplified - in real implementation would call enforcer
        }
        return true;
    }

    function getDelegation(bytes32 delegationId)
        external
        view
        returns (Delegation memory)
    {
        return delegations[delegationId];
    }

    function getSubDelegations(bytes32 parentId)
        external
        view
        returns (bytes32[] memory)
    {
        return subDelegations[parentId];
    }

    function _enforceCaveat(
        bytes32 delegationId,
        Caveat storage caveat,
        bytes calldata callData
    ) internal {
        // Call caveat enforcer to validate
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
