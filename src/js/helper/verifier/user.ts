import { TxnStandalone, TypeTxnStandaloneScope, User, Uleb128, TYPE_USER_ADMIN, TYPE_USER_ROOT } from "@/models/structure";
import { Context } from "@/context";

export const userExistInSystem = async (
    txn: TxnStandalone,
    ctx: Context,
    scope: TypeTxnStandaloneScope & {[key: string]: any}
) => {
    scope.userFromSystem = scope.userFromSystem || await ctx.getUserById(
        txn.get('data', User).getValue('userId', Uleb128)
    );

    return scope.userFromSystem !== null;
};

export const userNotExistInSystem = async (
    txn: TxnStandalone,
    ctx: Context,
    scope: TypeTxnStandaloneScope & {[key: string]: any}
) => {
    scope.userFromSystem = scope.userFromSystem || await ctx.getUserById(
        txn.get('data', User).getValue('userId', Uleb128)
    );

    return scope.userFromSystem === null;
};

export const insertingAdminHasLowerLevel = async (
    txn: TxnStandalone,
    ctx: Context,
    scope: TypeTxnStandaloneScope & {[key: string]: any}
) => {
    const user = txn.get('data', User).asType(TYPE_USER_ADMIN);
    const authorLevel = scope.author.getValue('level', Uleb128);
    const insertingAdminLevel = user.getValue('level');

    return authorLevel < insertingAdminLevel;
};

export const adminDelayEnd = async (
    txn: TxnStandalone,
    ctx: Context,
    scope: TypeTxnStandaloneScope & {[key: string]: any}
) => {
    const delay = ctx.getConfig().getAdminDelay();
    const author = scope.author;
    //@ts-ignore
    const timeEnd = txn.get('data').getValue('timeEnd', Uleb128);

    return timeEnd > Date.now() + delay;
};

export const adminDelayStart = async (
    txn: TxnStandalone,
    ctx: Context,
    scope: TypeTxnStandaloneScope & {[key: string]: any}
) => {
    const delay = ctx.getConfig().getAdminDelay();
    const author = scope.author;
    //@ts-ignore
    const timeStart = txn.get('data').getValue('timeStart', Uleb128);

    return timeStart > Date.now() + delay;
};

export const removingAdminHasLowerLevel = async (
    txn: TxnStandalone,
    ctx: Context,
    scope: TypeTxnStandaloneScope & {[key: string]: any}
) => {
    const user: User = scope.userFromSystem = scope.userFromSystem || await ctx.getUserById(
        txn.get('data', User).getValue('userId', Uleb128)
    );

    if (user.isType(TYPE_USER_ROOT)) return false;
    if (user.isType(TYPE_USER_ADMIN)) {
        return scope.author.getValue('level', Uleb128) >= user.getValue('level');
    }
    return true;
};

export const userIsUserOrPublic = async (
    txn: TxnStandalone,
    ctx: Context,
    scope: TypeTxnStandaloneScope & {[key: string]: any}
) => {
    const user: User = scope.userFromSystem = scope.userFromSystem || await ctx.getUserById(
        txn.get('data', User).getValue('userId', Uleb128)
    );

    return user.isUser() || user.isPublic();
}
