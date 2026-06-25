import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {
  BusinessPartner,
  BusinessPartnerApi,
  GetAllIdentifiersOfPartnerRequestParams,
  GetBusinessPartnerRequestParams,
  GetBusinessPartnersRequestParams,
  GetRegistrationsRequestParams,
  IdentifierApi,
  PagedModelBusinessPartnerListItem,
  PagedModelIdentifierResponse,
  PartnerCreationRequest,
  RegistrationApi
} from './generated';

export interface OrganizationUpdate {
  id: string;
  name: string;
  contactEmailAddress: string;
}

export interface OrganizationRegistration {
  name: string;
  contactEmailAddress: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private readonly registrationApi = inject(RegistrationApi);
  private readonly businessPartnerApi = inject(BusinessPartnerApi);
  private readonly identifierApi = inject(IdentifierApi);

  getRegistrations(requestParams: GetRegistrationsRequestParams) {
    return this.registrationApi.getRegistrations(requestParams);
  }

  registerOrganization(request: OrganizationRegistration) {
    const requestParameters = {
      registrationRequest: {
        organizationName: request.name,
        technicalEmailAddress: request.contactEmailAddress
      }
    };
    return this.registrationApi.registerOrganization(requestParameters);
  }

  registerBusinessPartner(request: PartnerCreationRequest): Observable<BusinessPartner> {
    const requestParameters = {
      partnerCreationRequest: {
        uid: request.uid,
        organizationName: request.organizationName,
        contactEmail: request.contactEmail,
        addressStreet: request.addressStreet,
        addressZipCode: request.addressZipCode,
        addressCity: request.addressCity,
        addressCountry: request.addressCountry,
        addressRegion: request.addressRegion,
        contactPhone: request.contactPhone,
        businessPartnerType: request.businessPartnerType
      }
    };
    return this.businessPartnerApi.registerBusinessPartner(requestParameters);
  }

  updateOrganization(request: OrganizationUpdate) {
    const requestParameters = {
      id: request.id,
      updateRequest: {
        organizationName: request.name,
        technicalEmailAddress: request.contactEmailAddress
      }
    };
    return this.registrationApi.updateOrganization(requestParameters);
  }

  getIdentifiersOfOrganization(
    requestParams: GetAllIdentifiersOfPartnerRequestParams
  ): Observable<PagedModelIdentifierResponse> {
    return this.identifierApi.getAllIdentifiersOfPartner(requestParams);
  }

  getBusinessPartner(requestParams: GetBusinessPartnerRequestParams): Observable<BusinessPartner> {
    return this.businessPartnerApi.getBusinessPartner(requestParams);
  }

  getBusinessPartners(requestParams: GetBusinessPartnersRequestParams): Observable<PagedModelBusinessPartnerListItem> {
    return this.businessPartnerApi.getBusinessPartners(requestParams);
  }
}
