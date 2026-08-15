const CACHE_NAME = "gomoku-v1.4.0";

const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./js/i18n.js",
  "./js/export.js",
  "./manifest.webmanifest",

  "./icons/icon-192.png",
  "./icons/icon-512.png"
];


/*
 * =========================================================
 * INSTALL
 * =========================================================
 */

self.addEventListener(
  "install",
  event => {

    event.waitUntil(
      caches
        .open(CACHE_NAME)
        .then(
          cache =>
            cache.addAll(
              APP_SHELL
            )
        )
        .then(
          () =>
            self.skipWaiting()
        )
    );

  }
);


/*
 * =========================================================
 * ACTIVATE
 * =========================================================
 */

self.addEventListener(
  "activate",
  event => {

    event.waitUntil(

      caches
        .keys()
        .then(
          keys =>
            Promise.all(
              keys
                .filter(
                  key =>
                    key !==
                    CACHE_NAME
                )
                .map(
                  key =>
                    caches.delete(
                      key
                    )
                )
            )
        )
        .then(
          () =>
            self.clients.claim()
        )

    );

  }
);


/*
 * =========================================================
 * FETCH
 * =========================================================
 *
 * App Shell：
 *   Cache First
 *
 * 其他資源：
 *   Network First → Cache
 *
 * 這樣 PWA 更新時不會永遠卡在舊版本。
 * =========================================================
 */

self.addEventListener(
  "fetch",
  event => {

    const request =
      event.request;

    if (
      request.method !==
      "GET"
    ) {
      return;
    }


    const url =
      new URL(
        request.url
      );


    /*
     * 只處理同源資源。
     */

    if (
      url.origin !==
      self.location.origin
    ) {
      return;
    }


    const isAppShell =
      APP_SHELL.some(
        path => {

          const shellURL =
            new URL(
              path,
              self.location.href
            );

          return (
            shellURL.href ===
            url.href
          );

        }
      );


    if (isAppShell) {

      event.respondWith(

        caches
          .match(request)
          .then(
            cached => {

              if (cached) {
                return cached;
              }

              return fetch(
                request
              ).then(
                response => {

                  if (
                    response &&
                    response.ok
                  ) {

                    const copy =
                      response.clone();

                    caches
                      .open(
                        CACHE_NAME
                      )
                      .then(
                        cache =>
                          cache.put(
                            request,
                            copy
                          )
                      );

                  }

                  return response;

                }
              );

            }
          )

      );

      return;
    }


    /*
     * 其他資源：
     * Network First
     */

    event.respondWith(

      fetch(
        request
      )
        .then(
          response => {

            if (
              response &&
              response.ok
            ) {

              const copy =
                response.clone();

              caches
                .open(
                  CACHE_NAME
                )
                .then(
                  cache =>
                    cache.put(
                      request,
                      copy
                    )
                );

            }

            return response;

          }
        )
        .catch(
          () =>
            caches.match(
              request
            )
        )

    );

  }
);
