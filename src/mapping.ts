import { BigInt } from "@graphprotocol/graph-ts"
import {
  StakingContract,
  Approval,
  AssetConfigUpdated,
  AssetIndexUpdated,
  Cooldown,
  DelegateChanged,
  DelegatedPowerChanged,
  Redeem,
  RewardsAccrued,
  RewardsClaimed,
  Staked,
  Transfer,
  UserIndexUpdated
} from "../generated/StakingContract/StakingContract"
import { ExampleEntity } from "../generated/schema"

export function handleApproval(event: Approval): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let entity = ExampleEntity.load(event.transaction.from.toHex())

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (!entity) {
    entity = new ExampleEntity(event.transaction.from.toHex())

    // Entity fields can be set using simple assignments
    entity.count = BigInt.fromI32(0)
  }

  // BigInt and BigDecimal math are supported
  entity.count = entity.count + BigInt.fromI32(1)

  // Entity fields can be set based on event parameters
  entity.owner = event.params.owner
  entity.spender = event.params.spender

  // Entities can be written to the store with `.save()`
  entity.save()

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.COOLDOWN_SECONDS(...)
  // - contract.DELEGATE_BY_TYPE_TYPEHASH(...)
  // - contract.DELEGATE_TYPEHASH(...)
  // - contract.DISTRIBUTION_END(...)
  // - contract.DOMAIN_SEPARATOR(...)
  // - contract.EIP712_REVISION(...)
  // - contract.EMISSION_MANAGER(...)
  // - contract.PERMIT_TYPEHASH(...)
  // - contract.REVISION(...)
  // - contract.REWARDS_VAULT(...)
  // - contract.REWARD_TOKEN(...)
  // - contract.STAKED_TOKEN(...)
  // - contract.UNSTAKE_WINDOW(...)
  // - contract._aaveGovernance(...)
  // - contract._nonces(...)
  // - contract._votingSnapshots(...)
  // - contract._votingSnapshotsCounts(...)
  // - contract.allowance(...)
  // - contract.approve(...)
  // - contract.assets(...)
  // - contract.balanceOf(...)
  // - contract.decimals(...)
  // - contract.decreaseAllowance(...)
  // - contract.getDelegateeByType(...)
  // - contract.getNextCooldownTimestamp(...)
  // - contract.getPowerAtBlock(...)
  // - contract.getPowerCurrent(...)
  // - contract.getTotalRewardsBalance(...)
  // - contract.getUserAssetData(...)
  // - contract.increaseAllowance(...)
  // - contract.isTrustedForwarder(...)
  // - contract.name(...)
  // - contract.stakerRewardsToClaim(...)
  // - contract.stakersCooldowns(...)
  // - contract.symbol(...)
  // - contract.totalSupply(...)
  // - contract.totalSupplyAt(...)
  // - contract.transfer(...)
  // - contract.transferFrom(...)
}

export function handleAssetConfigUpdated(event: AssetConfigUpdated): void {}

export function handleAssetIndexUpdated(event: AssetIndexUpdated): void {}

export function handleCooldown(event: Cooldown): void {}

export function handleDelegateChanged(event: DelegateChanged): void {}

export function handleDelegatedPowerChanged(
  event: DelegatedPowerChanged
): void {}

export function handleRedeem(event: Redeem): void {}

export function handleRewardsAccrued(event: RewardsAccrued): void {}

export function handleRewardsClaimed(event: RewardsClaimed): void {}

export function handleStaked(event: Staked): void {}

export function handleTransfer(event: Transfer): void {}

export function handleUserIndexUpdated(event: UserIndexUpdated): void {}
