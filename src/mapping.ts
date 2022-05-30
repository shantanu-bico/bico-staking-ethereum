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
import {Redeem as RedeemEntity, Staked as StakedEntity, RewardsAccrued as RewardsAccruedEntity, RewardsClaimed as RewardsClaimedEntity, UserStakedTotal, UniqueWallet, UniqueWalletCount, RollingStakedForLast24Hour, UserRedeemedTotal, RollingRedeemedForLast24Hour, CoolDownUser as CoolDownEntity, CoolDown ,CoolDownCount, RollingCoolDownForLast24Hour}  from "../generated/schema"

export function handleAssetConfigUpdated(event: AssetConfigUpdated): void {}

export function handleAssetIndexUpdated(event: AssetIndexUpdated): void {}

export function handleCooldown(event: Cooldown): void {
  const CoolDownUser = new CoolDownEntity(event.transaction.hash.toHex());
  CoolDownUser.userAddress = event.params.user;
  CoolDownUser.timestamp = event.block.timestamp;
  CoolDownUser.save();

  let coolDown = CoolDown.load(event.transaction.hash.toHex());
  if (coolDown == null) {
    let coolDownCount = CoolDownCount.load("0");

    if (coolDownCount == null) {
      coolDownCount = new CoolDownCount("0");
      coolDownCount.count = BigInt.fromI32(0);
    }

    coolDown = new CoolDown(event.transaction.hash.toHex());
    coolDown.count = BigInt.fromI32(0);

    coolDownCount.count = coolDownCount.count.plus(BigInt.fromI32(1));

    coolDownCount.save();

    let slidingCoolDownWindow = RollingCoolDownForLast24Hour.load("0");

    if (!slidingCoolDownWindow) {
      slidingCoolDownWindow = new RollingCoolDownForLast24Hour("0");
      slidingCoolDownWindow.count = BigInt.fromI32(0);
      slidingCoolDownWindow.cooldowns = new Array<string>();
    }
  
    let oldCoolDownLogs = slidingCoolDownWindow.cooldowns;
    let newCoolDownLogs = new Array<string>();
    newCoolDownLogs.push(CoolDownUser.id);
  
    // add the current feeDetailLogEntry to the cumulative values
    slidingCoolDownWindow.count += BigInt.fromI32(1);
  
    // sliding window calculation
    for (let i = 0; i < oldCoolDownLogs.length; i++) {
      // for every feeDetailLogEntry in the rolling window, check if they are old enough to remove
      // if so, then remove and also decrease their values from cumulative rolling window values
      let oldCoolDown = CoolDownEntity.load(oldCoolDownLogs[i]);
      if (!oldCoolDown) continue;
      if (CoolDownUser.timestamp.minus(oldCoolDown.timestamp) > BigInt.fromI32(86400)) {
        slidingCoolDownWindow.count -= BigInt.fromI32(1);
      } else {
        newCoolDownLogs.push(oldCoolDown.id);
      }
    }
    slidingCoolDownWindow.cooldowns = newCoolDownLogs;
    slidingCoolDownWindow.save();
  }

  coolDown.count = coolDown.count.plus(BigInt.fromI32(1));
  coolDown.save();

}

export function handleDelegateChanged(event: DelegateChanged): void {}

export function handleDelegatedPowerChanged(
  event: DelegatedPowerChanged
): void {}

export function handleRedeem(event: Redeem): void {
  const Redeem = new RedeemEntity(event.transaction.hash.toHex());
  Redeem.userAddress = event.params.to;
  Redeem.amount = event.params.amount.div(BigInt.fromI64(1000000000000000000));
  Redeem.timestamp = event.block.timestamp;
  Redeem.save();

  let userRedeemedTotal = UserRedeemedTotal.load("0");
  if (!userRedeemedTotal){
    userRedeemedTotal = new UserRedeemedTotal("0");
    userRedeemedTotal.totalRedeemed = BigInt.fromI32(0);
    userRedeemedTotal.timesRedeemed = BigInt.fromI32(0);
  }
  userRedeemedTotal.totalRedeemed += Redeem.amount;
  userRedeemedTotal.timesRedeemed += BigInt.fromI32(1);
  userRedeemedTotal.save();

  let slidingRedeemWindow = RollingRedeemedForLast24Hour.load("0");

  if (!slidingRedeemWindow) {
    slidingRedeemWindow = new RollingRedeemedForLast24Hour("0");
    slidingRedeemWindow.cumulativeAmount = BigInt.fromI32(0);
    slidingRedeemWindow.count = BigInt.fromI32(0);
    slidingRedeemWindow.redeems = new Array<string>();
  }

  // add the current feeDetailLogEntry to the sliding window
  // deposit.rollingWindow = slidingWindow.id;
  let oldRedeemLogs = slidingRedeemWindow.redeems;
  let newRedeemLogs = new Array<string>();
  newRedeemLogs.push(Redeem.id);

  // add the current feeDetailLogEntry to the cumulative values
  slidingRedeemWindow.cumulativeAmount += Redeem.amount;
  slidingRedeemWindow.count += BigInt.fromI32(1);

  // sliding window calculation
  for (let i = 0; i < oldRedeemLogs.length; i++) {
    // for every feeDetailLogEntry in the rolling window, check if they are old enough to remove
    // if so, then remove and also decrease their values from cumulative rolling window values
    let oldRedeem = RedeemEntity.load(oldRedeemLogs[i]);
    if (!oldRedeem) continue;
    if (Redeem.timestamp.minus(oldRedeem.timestamp) > BigInt.fromI32(86400)) {
      slidingRedeemWindow.cumulativeAmount = slidingRedeemWindow.cumulativeAmount.minus(
        oldRedeem.amount
      );
      slidingRedeemWindow.count -= BigInt.fromI32(1);
    } else {
      newRedeemLogs.push(oldRedeem.id);
    }
  }
  slidingRedeemWindow.redeems = newRedeemLogs;
  slidingRedeemWindow.save();
}

export function handleRewardsAccrued(event: RewardsAccrued): void {
  const RewardsAccrued = new RewardsAccruedEntity(event.transaction.hash.toHex());
  RewardsAccrued.userAddress = event.params.user;
  RewardsAccrued.accruedRewards = event.params.amount.div(BigInt.fromI64(1000000000000000000));
  RewardsAccrued.timestamp = event.block.timestamp;
  RewardsAccrued.save();
}

export function handleRewardsClaimed(event: RewardsClaimed): void {
  const RewardsClaimed = new RewardsClaimedEntity(event.transaction.hash.toHex());
  RewardsClaimed.userAddress = event.params.to;
  RewardsClaimed.amountToClaim = event.params.amount.div(BigInt.fromI64(1000000000000000000));
  RewardsClaimed.timestamp = event.block.timestamp;
  RewardsClaimed.save();
}

export function handleStaked(event: Staked): void {
  const Staked = new StakedEntity(event.transaction.hash.toHex());
  Staked.userAddress = event.params.from;
  Staked.amount = event.params.amount.div(BigInt.fromI64(1000000000000000000));
  Staked.timestamp = event.block.timestamp;

  let userStakedTotal = UserStakedTotal.load("0");
  if (!userStakedTotal){
    userStakedTotal = new UserStakedTotal("0");
    userStakedTotal.totalStaked = BigInt.fromI32(0);
    userStakedTotal.timesStaked = BigInt.fromI32(0);
  }
  userStakedTotal.totalStaked += Staked.amount;
  userStakedTotal.timesStaked += BigInt.fromI32(1);
  userStakedTotal.save();

  let uniqueWallet = UniqueWallet.load(event.params.from.toHex());
  if (uniqueWallet == null) {
    let uniqueWalletCount = UniqueWalletCount.load("0");

    if (uniqueWalletCount == null) {
      uniqueWalletCount = new UniqueWalletCount("0");
      uniqueWalletCount.count = BigInt.fromI32(0);
    }

    uniqueWallet = new UniqueWallet(event.params.from.toHexString());
    uniqueWallet.count = BigInt.fromI32(0);

    uniqueWalletCount.count = uniqueWalletCount.count.plus(BigInt.fromI32(1));

    uniqueWalletCount.save();
  }

  uniqueWallet.count = uniqueWallet.count.plus(BigInt.fromI32(1));
  uniqueWallet.save();

    let slidingStakedWindow = RollingStakedForLast24Hour.load("0");

    if (!slidingStakedWindow) {
      slidingStakedWindow = new RollingStakedForLast24Hour("0");
      slidingStakedWindow.cumulativeAmount = BigInt.fromI32(0);
      slidingStakedWindow.count = BigInt.fromI32(0);
      slidingStakedWindow.stakes = new Array<string>();
    }
  
    // add the current feeDetailLogEntry to the sliding window
    // deposit.rollingWindow = slidingWindow.id;
    let oldStakedLogs = slidingStakedWindow.stakes;
    let newStakedLogs = new Array<string>();
    newStakedLogs.push(Staked.id);
  
    // add the current feeDetailLogEntry to the cumulative values
    slidingStakedWindow.cumulativeAmount += Staked.amount;
    slidingStakedWindow.count += BigInt.fromI32(1);
  
    // sliding window calculation
    for (let i = 0; i < oldStakedLogs.length; i++) {
      // for every feeDetailLogEntry in the rolling window, check if they are old enough to remove
      // if so, then remove and also decrease their values from cumulative rolling window values
      let oldStake = StakedEntity.load(oldStakedLogs[i]);
      if (!oldStake) continue;
      if (Staked.timestamp.minus(oldStake.timestamp) > BigInt.fromI32(86400)) {
        slidingStakedWindow.cumulativeAmount = slidingStakedWindow.cumulativeAmount.minus(
          oldStake.amount
        );
        slidingStakedWindow.count -= BigInt.fromI32(1);
      } else {
        newStakedLogs.push(oldStake.id);
      }
    }
    slidingStakedWindow.stakes = newStakedLogs;
    slidingStakedWindow.save();
    Staked.save();
}

export function handleTransfer(event: Transfer): void {}

export function handleUserIndexUpdated(event: UserIndexUpdated): void {}
