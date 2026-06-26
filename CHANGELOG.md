# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 1.21.0

### Added

- Definition of entity name in multiple languages

## 1.20.3

### Fixed

- fix all CRITICAL and HIGH findings

## 1.20.2

### Fixed

- Fixed technical proof step texts

## 1.20.1

### Changed

- enable additional Documents upload for governmental

## 1.20.0

### Added

- Add status information for submissions in `INFORMATION_REQUESTED` state, informing users about the time limit to
  resubmit their data

## 1.19.0

### Added

- Trust onboarding documents step (formal proof): additional documents upload section shown only for BUSINESS partners
  that are not registered in the commercial register (no UID). Allows multiple PDF files up to 10 MB each and requires
  at least one document.
- Backend endpoint `POST /api/v1/trust-onboarding-submission/{id}/documents/other` to upload documents of type
  `TRUST_ONBOARDING_OTHER`. The endpoint now rejects (HTTP 400) uploads unless the submission's business partner is of
  type `BUSINESS` and is not registered in the commercial register, enforcing the same restriction as the frontend.
- Unguarded `/test/documents-step` route that renders the documents step with mocked services and test data for isolated
  testing.

## 1.18.4

### Added

- Add test for visual translation key toggle

## 1.18.3

### Added

- Add toggle (Ctr+shift+k) to display translation keys instead of value to enable designer to compare text keys with
  actual values

## 1.18.2

### Fixed

- Fixed small quality gate issue related to DefaultExceptionHandlerTest.java

## 1.18.1

### Fixed

- Log ClientAbortException at DEBUG level instead of ERROR

## 1.18.0

### Changed

- Add validation of declaration of intent to formal proof step of trust onboarding

## 1.17.1

### Changed

- Change email templates to correct text including the handover url.

## 1.17.0

### Added

- Add download of filled doi documents instead of having static mock file

## 1.16.0

### Added

- Added delete button for uploaded declaration of intent documents in the "Formellen Nachweis erbringen" step of the
  trust onboarding wizard, allowing users to remove a document before submitting.

## 1.15.0

### Added

- Copy data of base onboarding on initial trust onboarding submission

## 1.14.3

### Fixed

- Fixed start verification button not showing up when last submission was rejected.

## 1.14.2

### Fixed

- Fix stepper checkmarks not showing for all completed steps in both the base and trust onboarding wizards

## 1.14.1

### Fixed

- Adapt image and dependencies to fix several CVEs including CVE-2025-48924

## 1.14.0

### Fixed

- Fix validation in base onboadring process

## 1.13.3

### Fixed

- Fix sonar issues

## 1.13.2

### Fixed

- Fix validation in trust onboarding process and added properties to dto which have been forgotten to be mapped

## 1.13.1

### Added

- Extracted business partner detail action cards into a dedicated `BusinessPartnerDetailActionsComponent` with
  conditional actions: create identifier, sensitive data access, enter identifiers, supplement request, renew
  verification, verify profile, and partner profile.
- All action visibility logic is driven by computed signals based on `BusinessPartner` trust status,
  `IdentifierResponse` list, and remaining DID slots.

## 1.13.0

### Added

- Add signing rule and signatory definition to the trust onboarding submission.

## 1.12.37

### Changed

- "Continue later" in both onboarding wizards now persists progress to the backend when the form is valid, and warns
  about data loss via the unsaved-changes dialog when invalid.

### Fixed

- Make partner name error span the full grid width on the trust onboarding organisation details step.

## 1.12.36

### Fixed

- Handover details are only shown if proof of possession not provided yet
- Fix CVE-2026-32635 by upgrading to latest lts version of angular 20.3.20

### Changed

- Add listing of self-service portal apis in base onboarding
- Update identifier registry endpoint with didlog endpoint

## 1.12.35

### Changed

- Add the option to suppress api errors based on status codes.
- Use this functionality in the fetching of the latest trust onboarding submission.

## 1.12.34

### Fixed

- correctly redirect user after login flow

## 1.12.33

### Changed

- upgraded to core business api 3.23.1

## 1.12.32

### Added

- Added css / scss linting and formatting

## 1.12.31

### Fixed

- Add text for missing tooltips

## 1.12.30

### Fixed

- Remove `::ng-deep` usages: move `app-process-step` card styles into the component's own stylesheet using `:host`, and
  move Angular Material `mat-form-field` overrides in `did-details` to scoped global styles

## 1.12.29

### Fixed

- Fix usage of promise due to sonar finding

## 1.12.28

### Changed

- Updated setVersions script to ensure -SNAPSHOT suffix and CHANGELOG entry
- Added .git-hooks/pre-commit to block commits without entries in CHANGELOG.md

## 1.12.27

### Changed

- Improve accessibility of onboarding steppers: stepper headers are now hidden from screen readers and the tab order;
  step H1 headings include step position as aria-label; checkbox errors are linked via aria-invalid and aria-describedby

### Fixed

- Add missing tooltips and fix general ui issues
- Add base image to 25.0.3_9.1777631459-jdk-ubi9-minimal due to CVE-2026-4878

## 1.12.26

### Fixed

- fixed broken texts for partner limit alert

## 1.12.25

### Changed

- Update cookbook chapter links

## 1.12.24

### Changed

- Cleanup links, mailto links

## 1.12.23

### Changed

- added translated page title
- added missing alt-texts
- general AX improvements

## 1.12.22

### Fixed

- Resolved 26 npm vulnerabilities through dependency updates, including critical vulnerabilities in basic-ftp and
  handlebars
- Updated @openapitools/openapi-generator-cli from 2.18.4 to 2.31.1 to eliminate vulnerabilities in transitive
  dependencies
- CVE-2026-27699, CVE-2026-25639, CVE-2026-4800

## 1.12.21

### Fixed

- Exclude business partner role required to access API self-service-portal apimgmt%selfservice from token by using
  custom converter. Change was introduced by jeap with jeap-spring-boot-starters version 21.0.0.
  See https://bitbucket.bit.admin.ch/projects/JEAP/repos/jeap-spring-boot-starters/browse/CHANGELOG.md

## 1.12.20

### Changed

- Set links for new cookbook and update other external links

## 1.12.19

### Fixed

- Updated jeap-spring-boot-parent to 33.2.0 to resolve tomcat CVEs

## 1.12.18

### Changed

- version bump of basic-ftp to 5.2.0 to fix CVE-2026-27699

## 1.12.17

### Changed

- In the onboarding on DEV, use the additionalState for the redirect URL
- In the onboarding on DEV, display all businesspartner roles for the user.

## 1.12.16

### Changed

- Map core business service errors to dedicated business error codes and expose them consistently in API responses.
- Update Core Business Service API version to 3.22.6
- Handle backend business error codes in the UI error interceptor.

## 1.12.15

### Fixed

- Added pagination for dids

## 1.12.14

### Changed

- Set the `X-Frame-Options` to `SAMEORIGIN` for the silent-refresh.

## 1.12.13

### Changed

- Correct silent refresh for Keycloak Oauth Server
- Redirect to the correct page after reauthentication with the mock server and display the business partner information
  in a HTML dialog.

## 1.12.12

### Changed

- Product selection is now two-fold: environment is selected first, then products appear below after clicking continue
- No environment is pre-selected; selecting a different environment redirects to that environment's URL with the
  selection preserved
- Primary (production) environment card can be disabled via `primaryEnvironmentEnabled` functionality config flag

## 1.12.11

### Changed

- use url matching to determine which environment we are on

## 1.12.10

### Changed

- Reverted latest token handling change due to issue on local and dev environment

## 1.12.9

### Added

- preview product selection card

## 1.12.8

### Fixed

- Fixed token handling after creating new business partner

## 1.12.7

- Remove business partner trust chip on did detail page

## 1.12.6

- Added preview texts for partner creation

## 1.12.5

### Added

- Added Explainer Screen for adding additional DIDs

## 1.12.4

### Changed

- Make sure the pagination is displayed when there are more than 10 business partners.

## 1.12.3

### Fixed

- Update jeap-spring-boot-parent to 31.4.0 to resolve CVE CVE-2026-22732

## 1.12.2

### Changed

- allow configuration for disabling business partner types

## 1.12.1

### Changed

- Fixed start trust onboarding button not working.

## 1.12.0

### Changed

- Remove UI payment specific information when `payment-enabled` functionality is false.

## 1.11.7

### Changed

- Made base and trust onboarding wizard steppers stateful and linkable

## 1.11.6

### Changed

- Use correct introspection `client-id` for token introspection.

## 1.11.5

### Changed

- Fix broken dynamic links caused by wrong ICU MessageFormat syntax in translation strings

## 1.11.4

### Changed

- Change root url for service navigation on DEV

## 1.11.3

### Changed

- Use lightweight token mode to inspect pruned tokens therefore removing a technical limitation on roles per user.

## 1.11.2

### Fix

- Make linter work again and fix some linting issues

## 1.11.1

### Changed

- Increase parent jeap-spring-boot-parent to 30.19.0 to fix CVE GHSA-72hv-8253-57qq

## 1.11.0

### Changed

- Adapt base and onboarding flows with specific behaviour when automatic trust onboarding approval is enabled on
  swiyu-trust-management-scs site

## 1.10.3

### Fixed

- Shows configured identifier registry api url instead of hardcoded one

## 1.10.2

### Changed

- Fixes card overlap in case of small screen in did details screen

## 1.10.1

### Changed

- Refactored title translation of detail-section component

## 1.10.0

### Changed

- Updated java version from 21 to 25 and jeap parent from 30.10.0 to 30.15.0

## 1.9.23

### Changed

- updated trust onboarding flor for GOV partners

## 1.9.22

### Fixed

- Latest TrustOnboardingSubmission endpoint is now Business Partner aware

## 1.9.21

### Fixed

- Fixes slash duplication on identifier registry DID url

## 1.9.20

### Changed

- updated the gov onboarding flow process

## 1.9.19

### Changed

- updated jeap-spring-boot-parent to 30.10.0
- enabled support for detailed health metrics

## 1.9.18

### Fixed

- Fixed alert full row display in business partner detail view

## 1.9.17

### Fixed

- Rename uid field to uppercase UID so that it is saved by core service

## 1.9.16

### Fixed

- Handle case if no latest trust onboarding present yet
- Fix identifier api url path

## 1.9.15

### Fixed

- routing to new business partners ui is now also feature toggled

## 1.9.14

### Added

- Added data-cy attributes

## 1.9.13

### Fixed

- removed wrong unknown/start routing

## 1.9.12

### Fixed

- Refactored did-details component to use detail-section component, fixed some issues, extended detail-section with
  external links

## 1.9.11

### Fixed

- Fix starting trust onboarding not working due to missing partner ID

## 1.9.10

### Changed

- Fixed truncated text display in business partner detail view

## 1.9.9

### Changed

- Changed data-cy attributes in some fields

## 1.9.8

### Added

- Add DID-setup page

## 1.9.7

### Added

- Add radio-card component based on general design

## 1.9.6

### Added

- Add development handover step to base onboarding flow

## 1.9.5

### Fixed

- Fixed client id for oauth2 configuration

## 1.9.4

### Fixed

- English is now selectable as UI language

## 1.9.3

### Fixed

- default resource id is now bj-swiyu-ecosystem as configured in mock and real oauth server

## 1.9.2

### Fixed

- Register onboarding step translation keys in translateSetup to preserve them during i18n cleanup

## 1.9.1

### Added

- Partner profile detail page

## 1.9.0

### Added

- Partner registration view and welcome redirect component, which directs user to partner registration if no
  business partner is associated with the user.

## 1.8.2

### Added

- added data-cy attribute for onboarding fields

## 1.8.1

### Changed

- Cleanup app routes

## 1.8.0

### Added

- integrate service navigation into eportal

### Changed

- Make translations mandatory in build process

## 1.7.2

### Changed

- fixed loading of user profile

## 1.7.1

### Changed

- adapt feature toggle to allow old and new onboarding
- Cleanup routing logic

## 1.7.0

### Added

- Add business partner detail view

## 1.6.0

### Added

- UserProfile is now loaded after login via /api/user-profile. The UserProfile contains the information whether
  the user is within the governmental allowlist or not.

## 1.5.1

### Changed

- REST Endpoints are now secured by checking against the following roles:
    - ti*@trustonboardingsubmission*@read
    - ti*@trustonboardingsubmission*@write
    - ti*@identifier*#read
    - ti*@identifier*#write
    - ti*@businesspartner*#read
    - ti*@businesspartner*#write

## 1.5.0

### Changed

- Add partner profile creation

## 1.4.7

### Changed

- Internal UI refactoring around sw-page-container class

## 1.4.6

### Added

- Added static payment success screen

## 1.4.5

### Added

- Added data-cy to buttons

## 1.4.4

### Changed

- Fixed navigation on environment selection

## 1.4.3

### Changed

- PAMS_APP_ID is now a required env variable. The hardcoded PAMS-ID 301344 is removed.

## 1.4.2

### Changed

- Fix some sonar findings

## 1.4.1

### Changed

- Update ch.admin.bit.jeap:jeap-spring-boot-parent from 28.3.0 to 30.2.0

## 1.4.0

### Added

- Implement business partner admin overview page / switch to table concept

## 1.3.5

### Added

- Did Detail page

## 1.3.4

- fix onboarding stepper not advancing after successful submission

## 1.3.3

### Added

- add success badge when all proofs of possessions for an onboarding submission are valid.

## 1.3.2

### Changed

- fixed routing in trust onboarding introduction

## 1.3.1

### Changed

- change frontend validation of technical step to backend validation

## 1.3.0

### Added

- environment and product selection in base onboarding

## 1.2.38

### Changed

- only load trust onboarding submissions if user already has registered an organisation

## 1.2.37

### Added

- Base onboarding Skeleton

## 1.2.36

### Changed

- fixed step validation in trust onboarding flow

## 1.2.35

### Added

- Add technical verification step UI

## 1.2.34

### Added

- add data-cy attributes

## 1.2.33

### Changed

- Ignoring sonar issue for the moment which will be solved in upcoming story EID-5292

## 1.2.32

### Changed

- Update core internal api definition to provide business partner type for later promotion in base onboarding flow

## 1.2.31

### Changed

- Update org.openapitools:jackson-databind-nullable from 0.2.7 to 0.2.8
- Update org.openrewrite.maven:rewrite-maven-plugin from 6.19.0 to 6.23.0
- Update com.diffplug.spotless:spotless-maven-plugin from 2.46.1 to 3.1.0
- Update ch.admin.bit.jeap:jeap-spring-boot-parent from 27.3.0 to 28.3.0

## 1.2.30

### Added

- Add technical verification step UI

## 1.2.29

### Added

- add data-cy attributes

## 1.2.28

### Changed

- Service now uses input stream directly in trust onboarding document upload

## 1.2.27

### Added

- add letter of intent onboarding step including file upload

## 1.2.26

### Added

- add data-cy attributes

## 1.2.25

### Changed

- Upgraded to Oblique 14 and Angular 20

## 1.2.24

### Changed

- updated to latest core business api spec where Page is replaced by PagedModel

## 1.2.23

### Changed

- Use internal identifier endpoint instead of b2b one which caused 403 error before

### Changed

- Update Trust onboarding status chip

## 1.2.22

### Changed

- Update local setup to fix port clashes

## 1.2.21

### Changed

- Update maven from 3.9.10 to 3.9.11
- Update org.openapitools:openapi-generator-maven-plugin from 7.14.0 to 7.15.0
- Update org.apache.maven.plugins:maven-surefire-plugin from 3.5.2 to 3.5.4
- Update org.openapitools:jackson-databind-nullable from 0.2.6 to 0.2.7
- Update com.rudikershaw.gitbuildhook:git-build-hook-maven-plugin from 3.5.0 to 3.6.0
- Update org.openrewrite.maven:rewrite-maven-plugin from 6.12.1 to 6.19.0
- Update com.diffplug.spotless:spotless-maven-plugin from 2.45.0 to 2.46.1
- Update ch.admin.bit.jeap:jeap-spring-boot-parent from 27.1.1 to 27.2.0

## 1.2.20

### Changed

- feature toggle EIDARTFE_1122 can now be toggled via env variable FEATURES_EIDARTFE_1122

## 1.2.19

### Changed

- updated jeap-spring-boot-parent to 27.3.0

## 1.2.18

### Changed

- improved test coverage and solved sonar findings

## 1.2.17

### Added

- add MVP for new trust onboarding flow. Enabled by feature flag: EIDARTFE_1122

## 1.2.16

### Changed

- updated to latest jeap (which fixes CVE-2025-48989)

## 1.2.15

### Changed

- font is now loaded and does not result in 401 anymore

## 1.2.14

### Changed

- do not use enforced path segments for resources

## 1.2.13

### Changed

- Update maven from 3.9.9 to 3.9.10
- Update org.codehaus.mojo:build-helper-maven-plugin from 3.6.0 to 3.6.1
- Update org.openapitools:openapi-generator-maven-plugin from 7.13.0 to 7.14.0
- Update org.springframework.security:spring-security-crypto from 6.5.0 to 6.5.1
- Update org.openrewrite.maven:rewrite-maven-plugin from 6.9.0 to 6.12.1
- Update com.diffplug.spotless:spotless-maven-plugin from 2.44.4 to 2.45.0
- Update ch.admin.bit.jeap:jeap-spring-boot-parent from 26.50.1 to 26.68.0

## 1.2.12

### Other

- Update Interface Summaries

### Added

- new data-cy html attribute to locate the organization table for the front-end tests

## 1.2.11

### Changed

- Downgrade maven-surefire-plugin due to archunit incompatibility

## 1.2.10

### Changed

- Update maven from 3.9.7 to 3.9.9
- Update org.springframework.security:spring-security-crypto from 6.4.4 to 6.5.0
- Update org.openapitools:openapi-generator-maven-plugin from 7.7.0 to 7.13.0
- Update org.openrewrite.maven:rewrite-maven-plugin from 5.4.2 to 6.9.0
- Update com.tngtech.archunit:archunit-junit5 from 1.3.0 to 1.4.1
- Update ch.admin.bit.jeap:jeap-spring-boot-parent from 26.41.0 to 26.50.1

## 1.2.9

### Other

- Added spotless plugin

## 1.2.8

### Changed

- Set ui language based on url param so that eportal language is used when user navigates to the swiyu portal

## 1.2.7

### Changed

- Update openapi-generator-cli version to fix CVE-2025-27152

## 1.2.6

### Changed

- Adapt mail validation to use angular default Validators.email

## 1.2.5

### Changed

- Adapt mail template. Use "gemäss" instead of "gem" language

## 1.2.4

### Changed

- Adapt mail template. Use "preferred" instead of "default" language

### Added

- healthcheck of core business service as part of own health status

## 1.2.3

### Changed

- Internal UI improvements

## 1.2.2

### Changed

- Adapt onboarding mail template. Add missing language fr and add sample for did format

## 1.2.1

### Changed

- Display general error from backend as well which weren't sent over the excetiotn handler

## 1.2.0

### Added

- Now supports update of organisation name property.

## 1.1.10

### Changed

- Update jeap spring boot parent to latest version and exclude spring-security-crypto due to CVE-2025-22228

## 1.1.9

### Changed

- Renamed variable from STAGE to BANNER, because the sole usage is the oblique banner value. BANNER env variable is
  optional

## 1.1.8

### Changed

- Upgrade to Spring Boot Parent 26.38.0 to resolve CVE-2025-24813

## 1.1.7

### Changed

- Remove contact section from header widget because we don't wish to be contacted

## 1.1.6

### Changed

- Update translation in help section in header widget

## 1.1.5

### Changed

- Update mail validation to conform with html5 email validation

## 1.1.4

### Changed

- Updated different translations concerning legal texts/links

## 1.1.3

### Changed

- Updated different translations / overall naming and disable token refresh for local development because it is not
  supported by mockserver

## 1.1.2

### Fixed

- /actuator/prometheus is not any longer invoking health indicators

## 1.1.1

### Fixed

- Set connection timeout, read timeout and max redirects for rest client.

## 1.1.0

### Added

- Extending prometheus export with metrics for build

## 1.0.0

- Initial Release
