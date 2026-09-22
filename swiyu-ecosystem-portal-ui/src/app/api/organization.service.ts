import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {
  BusinessPartner,
  BusinessPartnerApi,
  GetAllIdentifiersOfPartnerRequestParams,
  GetBusinessPartnerRequestParams,
  GetBusinessPartnersRequestParams,
  IdentifierApi,
  PagedModelBusinessPartnerListItem,
  PagedModelIdentifierResponse,
  PartnerCreationRequest
} from './generated';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private readonly businessPartnerApi = inject(BusinessPartnerApi);
  private readonly identifierApi = inject(IdentifierApi);

  registerBusinessPartner(request: PartnerCreationRequest): Observable<BusinessPartner> {
    const requestParameters = {
      partnerCreationRequest: {
        uid: request.uid,
        organizationName: request.organizationName,
        businessPartnerType: request.businessPartnerType,
        address: request.address,
        contact: request.contact
      }
    };
    return this.businessPartnerApi.registerBusinessPartner(requestParameters);
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
