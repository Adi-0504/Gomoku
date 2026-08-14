"use strict";

/*
 * Gomoku 1.3 Service Worker
 *
 * App shell:
 * Network first
 *
 * Other same-origin static resources:
 * Stale while revalidate
 *
 * This prevents old app.js/style.css/index.html from
 * remaining permanently pinned in the browser cache.
 */

const CACHE_NAME = "gomoku-v6";

const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./ai-worker.js",
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
        .open(
          CACHE_NAME
        )

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
 * NETWORK FIRST
 * =========================================================
 */

async function networkFirst(
  request
) {

  try {

    const response =
      await fetch(
        request
      );


    if (
      response &&
      response.ok
    ) {

      const cache =
        await caches.open(
          CACHE_NAME
        );


      cache
        .put(
          request,
          response.clone()
        )
        .catch(
          () => {}
        );

    }


    return response;

  } catch {

    const cached =
      await caches.match(
        request
      );


    if (
      cached
    ) {

      return cached;

    }


    return caches.match(
      "./index.html"
    );

  }

}


/*
 * =========================================================
 * STALE WHILE REVALIDATE
 * =========================================================
 */

async function staleWhileRevalidate(
  request
) {

  const cached =
    await caches.match(
      request
    );


  const network =
    fetch(
      request
    )

      .then(
        response => {

          if (
            response &&
            response.ok
          ) {

            caches
              .open(
                CACHE_NAME
              )

              .then(
                cache =>
                  cache.put(
                    request,
                    response.clone()
                  )
              )

              .catch(
                () => {}
              );

          }


          return response;

        }
      )

      .catch(
        () =>
          null
      );


  return (
    cached ||
    network ||
    caches.match(
      "./index.html"
    )
  );

}


/*
 * =========================================================
 * FETCH
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
     * Never intercept external CDN requests.
     *
     * This is important because UI SFX comes from an
     * external ESM CDN and should be handled directly
     * by the browser.
     */

    if (
      url.origin !==
      self.location.origin
    ) {

      return;

    }


    const pathname =
      url.pathname;


    const isAppShell =
      pathname.endsWith("/") ||
      pathname.endsWith(
        "/index.html"
      ) ||
      pathname.endsWith(
        "/app.js"
      ) ||
      pathname.endsWith(
        "/style.css"
      ) ||
      pathname.endsWith(
        "/ai-worker.js"
      ) ||
      pathname.endsWith(
        "/manifest.webmanifest"
      ) ||
      pathname.endsWith(
        "/sw.js"
      );


    event.respondWith(

      isAppShell

        ? networkFirst(
            request
          )

        : staleWhileRevalidate(
            request
          )

    );

  }
);
