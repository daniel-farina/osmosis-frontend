import { KVStore } from "@keplr-wallet/common";
import { HasMapStore } from "@keplr-wallet/stores";
import { RatePretty } from "@keplr-wallet/unit";
import { maxTick, minTick } from "@osmosis-labs/math";
import { computed, makeObservable } from "mobx";

import { IMPERATOR_TX_REWARD_BASEURL } from "..";
import { ObservableQueryExternalBase } from "../base";

/** Queries Imperator for extrapolated APR of a given position's tick range. */
export class ObservableQueryPositionRangeApr extends ObservableQueryExternalBase<{
  spreadFactorApr: string;
  incentivesApr: string;
}> {
  constructor(
    kvStore: KVStore,
    baseURL: string,
    protected readonly poolId: string,
    protected readonly lowerTickIndex: number,
    protected readonly upperTickIndex: number
  ) {
    // TODO: add endpoint
    super(kvStore, baseURL, `/lp/v1/rewards/estimation/`);

    makeObservable(this);
  }

  @computed
  get apr(): RatePretty | undefined {
    // TODO: don't use mock data

    return new RatePretty(23);
  }
}

export class ObservableQueryPositionsRangeApr extends HasMapStore<ObservableQueryPositionRangeApr> {
  constructor(
    kvStore: KVStore,
    poolRewardsBaseUrl = IMPERATOR_TX_REWARD_BASEURL
  ) {
    super((key) => {
      const { poolId, lowerTickIndex, upperTickIndex } = parseKey(key);
      return new ObservableQueryPositionRangeApr(
        kvStore,
        poolRewardsBaseUrl,
        poolId,
        lowerTickIndex,
        upperTickIndex
      );
    });
  }

  get(poolId: string, lowerTickIndex?: number, upperTickIndex?: number) {
    const key = makeKey(
      poolId,
      lowerTickIndex ?? Number(minTick.toString()),
      upperTickIndex ?? Number(maxTick.toString())
    );
    return super.get(key) as ObservableQueryPositionRangeApr;
  }
}

function makeKey(
  poolId: string,
  lowerTickIndex: number,
  upperTickIndex: number
) {
  return `${poolId}:${lowerTickIndex}:${upperTickIndex}`;
}

function parseKey(key: string) {
  const [poolId, lowerTickIndex, upperTickIndex] = key.split(":");

  return {
    poolId,
    lowerTickIndex: parseInt(lowerTickIndex),
    upperTickIndex: parseInt(upperTickIndex),
  };
}
