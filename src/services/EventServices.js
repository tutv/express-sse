const _store = {
    state: {},
    subscribers: []
};

exports.subscribe = (subscriber) => {
    if (typeof subscriber !== 'function') {
        return;
    }

    const {subscribers} = _store;

    if (subscribers.indexOf(subscriber) !== -1) {
        return;
    }

    _store.subscribers = [].concat(subscribers, [subscriber]);
};

exports.unsubscribe = (subscriber) => {
    _store.subscribers = _store.subscribers.filter(sub => sub !== subscriber);
};

exports.broadcast = (state) => {
    _store.state = Object.assign({}, _store.state, state);

    _store.subscribers.forEach(subscribe => {
        typeof subscribe === 'function' && subscribe(_store.state);
    });
};