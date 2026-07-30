import { TRANSACTION_VALIDITY } from '../utils/constants';
import { stringToBigNumber, validatePositiveNumber } from '../utils/helpers';
import { checkBuyableSc, checkSellableSc, tradeDataPriceBuySc, tradeDataPriceSellSc, calculateTxFees, isTxLimitReached } from '../utils/ethereum';

export const updateBuyTradeData = async (amountScaled, djedContract, decimals, coinsDetails, systemParams, accountDetails, coinBudgets, getFutureScPrice, setBuyValidity, setTradeData, isWalletConnected, isWrongChain) => {
    const inputSanity = validatePositiveNumber(amountScaled);
    if (inputSanity !== TRANSACTION_VALIDITY.OK) {
        setBuyValidity(inputSanity);
        return;
    }
    try {
        const data = await tradeDataPriceBuySc(djedContract, decimals.scDecimals, amountScaled);
        const futureSCPrice = await getFutureScPrice({ amountBC: data.totalUnscaled, amountSC: data.amountUnscaled });
        const { f } = calculateTxFees(data.totalUnscaled, systemParams?.feeUnscaled, 0);
        const isRatioAboveMinimum = isRatioAboveMin({
            totalScSupply: BigNumber.from(coinsDetails?.unscaledNumberSc).add(BigNumber.from(data.amountUnscaled)),
            scPrice: BigNumber.from(futureSCPrice),
            reserveBc: BigNumber.from(coinsDetails?.unscaledReserveBc).add(BigNumber.from(data.totalUnscaled).add(f))
        });

        setTradeData(data);
        if (!isWalletConnected) {
            setBuyValidity(TRANSACTION_VALIDITY.WALLET_NOT_CONNECTED);
        } else if (isWrongChain) {
            setBuyValidity(TRANSACTION_VALIDITY.WRONG_NETWORK);
        } else if (isTxLimitReached(amountScaled, coinsDetails.unscaledNumberSc, systemParams.thresholdSupplySC)) {
            setBuyValidity(TRANSACTION_VALIDITY.TRANSACTION_LIMIT_REACHED);
        } else if (stringToBigNumber(accountDetails.unscaledBalanceBc, BC_DECIMALS).lt(stringToBigNumber(data.totalBCUnscaled, BC_DECIMALS))) {
            setBuyValidity(TRANSACTION_VALIDITY.INSUFFICIENT_BC);
        } else if (!isRatioAboveMinimum) {
            setBuyValidity(TRANSACTION_VALIDITY.RESERVE_RATIO_LOW);
        } else {
            checkBuyableSc(djedContract, data.amountUnscaled, coinBudgets?.unscaledBudgetSc).then((res) => {
                setBuyValidity(res);
            });
        }
    } catch (error) {
        console.log('error', error);
    }
};

export const updateSellTradeData = async (amountScaled, djedContract, decimals, coinsDetails, systemParams, accountDetails, getFutureScPrice, setSellValidity, setTradeData, isWalletConnected, isWrongChain) => {
    const inputSanity = validatePositiveNumber(amountScaled);
    if (inputSanity !== TRANSACTION_VALIDITY.OK) {
        setSellValidity(inputSanity);
        return;
    }
    try {
        const data = await tradeDataPriceSellSc(djedContract, decimals.scDecimals, amountScaled);
        setTradeData(data);
        if (!isWalletConnected) {
            setSellValidity(TRANSACTION_VALIDITY.WALLET_NOT_CONNECTED);
        } else if (isWrongChain) {
            setSellValidity(TRANSACTION_VALIDITY.WRONG_NETWORK);
        } else if (isTxLimitReached(amountScaled, coinsDetails.unscaledNumberSc, systemParams.thresholdSupplySC)) {
            setSellValidity(TRANSACTION_VALIDITY.TRANSACTION_LIMIT_REACHED);
        } else if (stringToBigNumber(accountDetails.unscaledBalanceSc, decimals.scDecimals).lt(stringToBigNumber(data.amountUnscaled, decimals.scDecimals))) {
            setSellValidity(TRANSACTION_VALIDITY.INSUFFICIENT_SC);
        } else {
            checkSellableSc(data.amountUnscaled, accountDetails?.unscaledBalanceSc).then((res) => setSellValidity(res));
        }
    } catch (error) {
        console.log('error', error);
    }
};
