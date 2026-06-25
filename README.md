# SWIYU Ecosystem Portal

## Getting Started

To start the application locally run the following command:

```shell
mvn install # will also build the ui
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

Add the `mock-registration-service` profile as well, if you wish to mock the communication with the core business
service for the registration.

### Spring Profiles

The backend uses a combination of Spring profiles to control which external services are used. IntelliJ run
configurations for common combinations are provided in `.run/`.

| Profile combination | IntelliJ config | When to use |
|---|---|---|
| `local` | `start:backend` | Default. All external service URLs point to `localhost:8200` (no real services needed). |
| `local,shared` | `start:backend:shared` | Same as `local` for now — reserved for a future docker-compose/mock setup for shared dependencies. |
| `local,shared,shared-dev` | `start:backend:shared:dev` | Points external service URLs at the real **DEV** cloud environment (trust registry, identifier registry, core business service). Use this when you need to test against live DEV APIs. |

The compound configs (`start:app:shared`, `start:app:shared:dev`) start both the Angular UI (`npm run start`, port 4501)
and the backend (port 8501) together.

**Why `local` and `shared` are separate:** `local` is for personal/machine-specific overrides. `shared` is intended to
hold team-wide configuration for a docker-compose-based mock infrastructure once that is set up. Until then it is empty
and behaves identically to `local`.

### PAMS API Proxy

To use/test the service navigation in local development please use the pams API proxy.
see: https://bitbucket.bit.admin.ch/projects/EPORTAL/repos/pams-proxy/browse/readme.md?at=refs/heads/master

after install you can use the following command to start your local proxy:

```shell
$ pams-proxy --env=ref --level S2Plus --host \
  --uuid <YOUR_ePORTAL_UUID> 
```

Replace <YOUR_ePORTAL_UUID> with your users eportal id (see: https://eportal-r.admin.ch/profile/details)
If you set the env variables you could use the following command:

```shell
$ pams-proxy --uuid $AUTH_PAMS_USER_ID --qa $AUTH_PAMS_QA --host https://portal-r.trust-infra.swiyu.admin.ch --level S2Plus --env=ref  
```