# Code Review Findings

## 1. Silent task failures in scheduler

`TaskScheduler.executeCommand` catches errors and returns `void`, even though callers expect a typed response. When `initialise` calls it to load tasks, a thrown error would yield `tasks` as `undefined`, and `tasks.length` would throw at runtime. Scheduled task runs would likewise continue after swallowed failures, hiding operational issues. Consider letting errors propagate or returning a defined fallback while notifying the caller so scheduler flow can short-circuit safely.

## 2. Global event listener teardown on websocket disconnect

`AppServer` binds `eventBus.removeAll` to every websocket’s `close` event. When any connection closes, this removes **all** listeners on the shared event bus, potentially breaking other active sockets and server-side consumers. Each connection should unsubscribe only its own handlers (e.g., track the subscription returned by `eventBus.onAll` and dispose it on that socket’s close).

## 3. Session cookie lacks security attributes

`SessionIdHandler` sets the `ynab-plus-session-id` cookie without `Secure`, `SameSite`, `Path`, or an explicit lifetime. Websocket session identifiers could be transmitted over insecure channels or shared across subpaths/sites in ways that increase fixation/CSRF risk. Setting `Secure; SameSite=Lax; Path=/` (and possibly `Max-Age`) would harden the handshake.
