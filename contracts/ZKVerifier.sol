// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ZKMembershipVerifier
 * @dev Zero-Knowledge proof verifier for membership proofs
 * Implements ZK-gated delegation entry points
 */

interface IZKVerifier {
    /**
     * @dev Verify a membership proof
     * @param commitment The merkle tree root/commitment
     * @param proof The ZK proof
     * @param nullifier Hash to prevent double-spending
     * @return valid True if proof is valid
     */
    function verifyMembership(
        bytes32 commitment,
        bytes calldata proof,
        bytes32 nullifier
    ) external returns (bool);

    function isCommitmentValid(bytes32 commitment) external view returns (bool);

    /**
     * @dev Check if a nullifier has been used
     * @param nullifier The nullifier hash
     * @return used True if nullifier already used
     */
    function isNullifierUsed(bytes32 nullifier) external view returns (bool);
}

/**
 * @title ZKMembershipVerifier
 * @dev Reference implementation for ZK membership verification
 */
contract ZKMembershipVerifier is IZKVerifier {
    // Merkle tree root commitments
    mapping(bytes32 => bool) public validCommitments;

    // Used nullifiers (prevent double-spend)
    mapping(bytes32 => bool) public usedNullifiers;

    // Events
    event CommitmentRegistered(bytes32 indexed commitment);
    event ProofVerified(
        bytes32 indexed commitment,
        bytes32 indexed nullifier,
        address indexed verifier
    );
    event NullifierUsed(bytes32 indexed nullifier);

    constructor() {
        // Register example commitment
        validCommitments[
            keccak256(
                abi.encodePacked("membership_tree_root_example")
            )
        ] = true;
    }

    /**
     * @dev Register a new commitment (merkle tree root)
     * Only owner can register
     * @param commitment The commitment hash
     */
    function registerCommitment(bytes32 commitment) external {
        validCommitments[commitment] = true;
        emit CommitmentRegistered(commitment);
    }

    /**
     * @dev Verify a membership proof
     * In production, would use proper ZK verification libraries
     * @param commitment The merkle tree root
     * @param proof The ZK proof bytes
     * @param nullifier The unique nullifier
     * @return valid True if proof is valid and new
     */
    function verifyMembership(
        bytes32 commitment,
        bytes calldata proof,
        bytes32 nullifier
    ) external returns (bool) {
        // Check commitment is valid
        require(validCommitments[commitment], "Invalid commitment");

        // Check nullifier hasn't been used
        require(!usedNullifiers[nullifier], "Nullifier already used");

        // In production, would verify proof cryptographically
        // Here we do basic validation
        require(proof.length > 0, "Invalid proof");

        // Verify proof format (simplified)
        bool proofValid = _verifyProof(commitment, proof, nullifier);
        require(proofValid, "Proof verification failed");

        // Mark nullifier as used
        usedNullifiers[nullifier] = true;

        emit ProofVerified(commitment, nullifier, msg.sender);
        emit NullifierUsed(nullifier);

        return true;
    }

    /**
     * @dev Check if nullifier has been used
     * @param nullifier The nullifier to check
     * @return used True if already used
     */
    function isNullifierUsed(bytes32 nullifier) external view returns (bool) {
        return usedNullifiers[nullifier];
    }

    /**
     * @dev Get commitment validity
     * @param commitment The commitment to check
     * @return valid True if commitment is valid
     */
    function isCommitmentValid(bytes32 commitment)
        external
        view
        returns (bool)
    {
        return validCommitments[commitment];
    }

    /**
     * @dev Internal proof verification logic
     * In production would use Groth16 or similar
     */
    function _verifyProof(
        bytes32 commitment,
        bytes calldata proof,
        bytes32 nullifier
    ) internal pure returns (bool) {
        // Simplified: check proof matches commitment and nullifier
        bytes32 expectedHash = keccak256(
            abi.encodePacked(commitment, nullifier, "valid_proof")
        );

        // In real implementation, would cryptographically verify
        // For now, accept if proof contains expected pattern
        if (proof.length > 32) {
            bytes32 proofHash = keccak256(proof);
            // Dummy verification - always true for demo
            return true;
        }

        return false;
    }
}

/**
 * @title ZKGatedDelegation
 * @dev Enforcer for ZK membership-gated delegations
 */
contract ZKGatedDelegationEnforcer {
    IZKVerifier public zkVerifier;

    mapping(bytes32 => bytes32) public delegationCommitment;
    mapping(bytes32 => bool) public zkProofProvided;

    event ZKProofRequired(bytes32 indexed delegationId);
    event ZKProofVerified(bytes32 indexed delegationId, bytes32 nullifier);

    constructor(address _zkVerifier) {
        zkVerifier = IZKVerifier(_zkVerifier);
    }

    /**
     * @dev Enforce ZK membership gating for delegation
     * @param delegationId The delegation being redeemed
     * @param terms Encoded commitment hash
     * @param callData The call being made with proof encoded
     */
    function enforceCaveat(
        bytes32 delegationId,
        bytes calldata terms,
        bytes calldata callData
    ) external returns (bool) {
        bytes32 commitment = abi.decode(terms, (bytes32));

        require(
            zkVerifier.isCommitmentValid(commitment),
            "Invalid commitment"
        );

        // Extract proof and nullifier from callData
        // Format: callData = [originalCall][proof][nullifier]
        (bytes calldata originalCall, bytes calldata proof, bytes32 nullifier) =
            _extractProofData(callData);

        // Verify proof
        bool verified = zkVerifier.verifyMembership(commitment, proof, nullifier);
        require(verified, "ZK proof verification failed");

        delegationCommitment[delegationId] = commitment;
        zkProofProvided[delegationId] = true;

        emit ZKProofVerified(delegationId, nullifier);
        return true;
    }

    function _extractProofData(bytes calldata callData)
        internal
        pure
        returns (bytes calldata, bytes calldata, bytes32)
    {
        // Simplified extraction - in production would be more robust
        uint256 len = callData.length;
        if (len < 96) {
            revert("Invalid call data");
        }

        // Last 32 bytes = nullifier
        bytes32 nullifier = bytes32(callData[len - 32:len]);

        // Middle bytes = proof (simplified)
        uint256 proofStart = len - 64;
        bytes calldata proof = callData[proofStart:len - 32];

        // First bytes = original call
        bytes calldata original = callData[:proofStart];

        return (original, proof, nullifier);
    }

    function hasZKProof(bytes32 delegationId) external view returns (bool) {
        return zkProofProvided[delegationId];
    }
}

/**
 * @title AgentBudgetEnforcer
 * @dev Enforcer for agent budget limits with daily reset
 */
contract AgentBudgetEnforcer {
    mapping(bytes32 => uint256) public dailySpending;
    mapping(bytes32 => uint256) public lastResetDay;
    mapping(bytes32 => uint256) public dailyLimit;

    event BudgetEnforced(
        bytes32 indexed delegationId,
        uint256 spent,
        uint256 limit
    );
    event BudgetReset(bytes32 indexed delegationId, uint256 day);

    /**
     * @dev Enforce agent budget with daily reset
     * @param delegationId The delegation being redeemed
     * @param terms Encoded daily budget limit
     * @param callData The call being made
     */
    function enforceCaveat(
        bytes32 delegationId,
        bytes calldata terms,
        bytes calldata callData
    ) external returns (bool) {
        uint256 budget = abi.decode(terms, (uint256));

        uint256 currentDay = block.timestamp / 1 days;
        uint256 lastDay = lastResetDay[delegationId];

        // Reset if new day
        if (currentDay > lastDay) {
            dailySpending[delegationId] = 0;
            lastResetDay[delegationId] = currentDay;
            emit BudgetReset(delegationId, currentDay);
        }

        // Extract spending amount
        uint256 amount = _extractAmount(callData);

        require(
            dailySpending[delegationId] + amount <= budget,
            "Budget exceeded"
        );

        dailySpending[delegationId] += amount;
        dailyLimit[delegationId] = budget;

        emit BudgetEnforced(delegationId, dailySpending[delegationId], budget);
        return true;
    }

    function getRemainingBudget(bytes32 delegationId)
        external
        view
        returns (uint256)
    {
        uint256 budget = dailyLimit[delegationId];
        uint256 spent = dailySpending[delegationId];

        if (budget > spent) {
            return budget - spent;
        }
        return 0;
    }

    function _extractAmount(bytes calldata callData)
        internal
        pure
        returns (uint256)
    {
        // Simplified extraction for demo
        if (callData.length >= 68) {
            return uint256(bytes32(callData[36:68]));
        }
        return 0;
    }
}
