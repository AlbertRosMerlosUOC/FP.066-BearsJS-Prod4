import { createClient } from 'graphql-ws';
 
const client = createClient({
  url: 'ws://localhost:4000/graphql',
});
 
// query
(async () => {
  const result = await new Promise((resolve, reject) => {
    let result;
    client.subscribe(
      {
        query: '{ hello }',
      },
      {
        next: (data) => (result = data),
        error: reject,
        complete: () => resolve(result),
      },
    );
  });
 
  expect(result).toEqual({ hello: 'Hello World!' });
})();
 
// subscription
(async () => {
  const onNext = () => {
    /* handle incoming values */
  };
 
  let unsubscribe = () => {
    /* complete the subscription */
  };
 
  await new Promise((resolve, reject) => {
    unsubscribe = client.subscribe(
      {
        query: 'subscription { greetings }',
      },
      {
        next: onNext,
        error: reject,
        complete: resolve,
      },
    );
  });
 
  expect(onNext).toBeCalledTimes(5); // we say "Hi" in 5 languages
})();