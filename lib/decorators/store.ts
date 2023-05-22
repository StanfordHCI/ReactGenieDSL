import {Store} from "redux";

let genieActionFunc: () => any = null;
let genieActionReturnVal: any = null;

export let sharedStore: Store = null;
export let sharedState: {} = null;

export let objects: {} = {};

export let originalClasses: {} = {};

export function setSharedStore(store: Store) {
    sharedStore = store;
}

export function storeReducer(state: {} = {}, action: { type: string, payload: any }) {
    if (action.type === "genieAction") {
        sharedState = state;
        genieActionReturnVal = genieActionFunc();
        return state;
    }
    return state;
}

export function genieDispatch(func: () => any) {
    if (genieActionFunc != null) {
        // already in a genieDispatch
        return func();
    } else {
        genieActionFunc = func;
        sharedStore.dispatch({type: "genieAction", payload: genieActionReturnVal});
        genieActionFunc = null;
        return genieActionReturnVal;
    }
}