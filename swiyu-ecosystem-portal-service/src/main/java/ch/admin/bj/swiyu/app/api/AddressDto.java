package ch.admin.bj.swiyu.app.api;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "Address")
public record AddressDto(String street, String city, String postalCode, String country, String region) {}
