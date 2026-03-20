// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title CaveatEnforcers
 * @dev Collection of caveat enforcer contracts for custom permission models
 */

/**
 * @dev Enforcer for native token transfer amount limits
 */
contract NativeTokenTransferAmountEnforcer {
    mapping(bytes32 => uint256) public spentAmount;
    mapping(bytes32 => uint256) public maxAmount;
    mapping(bytes32 => uint256) public resetTime;

    event CaveatEnforced(
        bytes32 indexed delegationId,
        uint256 spent,
        uint256 maxAmount
    );

    /**
     * @dev Enforce amount limit on native token transfers
     * @param delegationId The delegation being redeemed
     * @param terms Encoded max amount and period
     * @param callData The call being made
     */
    function enforceCaveat(
        bytes32 delegationId,
        bytes calldata terms,
        bytes calldata callData
    ) external returns (bool) {
        (uint256 max, uint256 period) = abi.decode(terms, (uint256, uint256));

        // Reset if period has passed
        if (block.timestamp > resetTime[delegationId] + period) {
            spentAmount[delegationId] = 0;
            resetTime[delegationId] = block.timestamp;
        }

        // Extract amount from call data (assumes transfer function)
        uint256 value = _extractCallValue(callData);

        require(spentAmount[delegationId] + value <= max, "Amount exceeds limit");

        spentAmount[delegationId] += value;
        maxAmount[delegationId] = max;

        emit CaveatEnforced(delegationId, spentAmount[delegationId], max);
        return true;
    }

    function getRemainingBudget(bytes32 delegationId)
        external
        view
        returns (uint256)
    {
        return maxAmount[delegationId] - spentAmount[delegationId];
    }

    function _extractCallValue(bytes calldata callData)
        internal
        pure
        returns (uint256)
    {
        // Simplified: extract amount from transfer call
        if (callData.length >= 68) {
            return uint256(bytes32(callData[36:68]));
        }
        return 0;
    }
}

/**
 * @dev Enforcer for time-bound permissions
 */
contract TimeBoundEnforcer {
    event TimeBoundEnforced(
        bytes32 indexed delegationId,
        uint256 startTime,
        uint256 endTime
    );

    /**
     * @dev Enforce time window for delegation use
     * @param delegationId The delegation being redeemed
     * @param terms Encoded start and end times
     * @param callData The call being made
     */
    function enforceCaveat(
        bytes32 delegationId,
        bytes calldata terms,
        bytes calldata callData
    ) external returns (bool) {
        (uint256 startTime, uint256 endTime) = abi.decode(
            terms,
            (uint256, uint256)
        );

        require(
            block.timestamp >= startTime && block.timestamp <= endTime,
            "Outside time window"
        );

        emit TimeBoundEnforced(delegationId, startTime, endTime);
        return true;
    }

    function isTimeValid(
        uint256 startTime,
        uint256 endTime
    ) external view returns (bool) {
        return block.timestamp >= startTime && block.timestamp <= endTime;
    }
}

/**
 * @dev Enforcer for allowed targets and methods
 */
contract AllowedTargetsEnforcer {
    mapping(bytes32 => address[]) public allowedTargets;

    event TargetAllowed(bytes32 indexed delegationId, address indexed target);
    event TargetEnforced(bytes32 indexed delegationId, address target);

    function addAllowedTarget(bytes32 delegationId, address target) external {
        allowedTargets[delegationId].push(target);
        emit TargetAllowed(delegationId, target);
    }

    /**
     * @dev Enforce allowed targets
     * @param delegationId The delegation being redeemed
     * @param terms Encoded target whitelist
     * @param callData The call being made
     */
    function enforceCaveat(
        bytes32 delegationId,
        bytes calldata terms,
        bytes calldata callData
    ) external returns (bool) {
        address[] memory targets = abi.decode(terms, (address[]));

        // In real implementation, would check target from call context
        // For now, simplified check
        require(targets.length > 0, "No targets allowed");

        emit TargetEnforced(delegationId, targets[0]);
        return true;
    }

    function getAllowedTargets(bytes32 delegationId)
        external
        view
        returns (address[] memory)
    {
        return allowedTargets[delegationId];
    }
}

/**
 * @dev Enforcer for allowed methods/functions
 */
contract AllowedMethodsEnforcer {
    mapping(bytes32 => bytes4[]) public allowedMethods;

    event MethodAllowed(
        bytes32 indexed delegationId,
        bytes4 indexed methodSelector
    );

    function addAllowedMethod(bytes32 delegationId, bytes4 methodSelector)
        external
    {
        allowedMethods[delegationId].push(methodSelector);
        emit MethodAllowed(delegationId, methodSelector);
    }

    /**
     * @dev Enforce allowed methods
     * @param delegationId The delegation being redeemed
     * @param terms Encoded method selectors
     * @param callData The call being made
     */
    function enforceCaveat(
        bytes32 delegationId,
        bytes calldata terms,
        bytes calldata callData
    ) external returns (bool) {
        bytes4[] memory methods = abi.decode(terms, (bytes4[]));

        // Extract method selector from callData
        bytes4 methodSelector = bytes4(callData[:4]);

        bool allowed = false;
        for (uint256 i = 0; i < methods.length; i++) {
            if (methods[i] == methodSelector) {
                allowed = true;
                break;
            }
        }

        require(allowed, "Method not allowed");
        return true;
    }

    function getAllowedMethods(bytes32 delegationId)
        external
        view
        returns (bytes4[] memory)
    {
        return allowedMethods[delegationId];
    }
}

/**
 * @dev Enforcer for rate limiting (actions per time period)
 */
contract RateLimitEnforcer {
    mapping(bytes32 => uint256) public actionCount;
    mapping(bytes32 => uint256) public lastResetTime;

    event RateLimited(
        bytes32 indexed delegationId,
        uint256 currentCount,
        uint256 maxPerHour
    );

    /**
     * @dev Enforce rate limiting
     * @param delegationId The delegation being redeemed
     * @param terms Encoded max actions per hour
     * @param callData The call being made
     */
    function enforceCaveat(
        bytes32 delegationId,
        bytes calldata terms,
        bytes calldata callData
    ) external returns (bool) {
        uint256 maxPerHour = abi.decode(terms, (uint256));

        // Reset if hour has passed
        if (block.timestamp > lastResetTime[delegationId] + 1 hours) {
            actionCount[delegationId] = 0;
            lastResetTime[delegationId] = block.timestamp;
        }

        require(actionCount[delegationId] < maxPerHour, "Rate limit exceeded");

        actionCount[delegationId]++;

        emit RateLimited(delegationId, actionCount[delegationId], maxPerHour);
        return true;
    }

    function getRemainingActions(
        bytes32 delegationId,
        uint256 maxPerHour
    ) external view returns (uint256) {
        uint256 current = actionCount[delegationId];
        if (maxPerHour > current) {
            return maxPerHour - current;
        }
        return 0;
    }
}
