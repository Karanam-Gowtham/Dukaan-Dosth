package com.Dukaan_Dost.backend.DTOs;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {

    private String name;
    private String phone;
    private String password;
}