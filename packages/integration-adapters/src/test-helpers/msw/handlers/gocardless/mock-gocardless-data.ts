export const mockGocardlessData = {
  secretId: "secret-id",
  secretKey: "secret-key",
  mockToken: "the-token",
  mockRefreshToken: "the-refresh-token",
  mockInstititionsList: [
    {
      id: "ABNAMRO_ABNAGB2LXXX",
      name: "ABN AMRO Bank Commercial",
      bic: "ABNAGB2LXXX",
      transaction_total_days: "540",
      countries: ["GB"],
      logo: "https://storage.googleapis.com/gc-prd-institution_icons-production/UK/PNG/abnamrobank.png",
      max_access_valid_for_days: "90",
      max_access_valid_for_days_reconfirmation: "730",
    },
    {
      id: "REVOLUT_REVOGB21",
      name: "Revolut",
      bic: "REVOGB21",
      transaction_total_days: "730",
      countries: ["GB"],
      logo: "https://storage.googleapis.com/gc-prd-institution_icons-production/UK/PNG/revolut.png",
      max_access_valid_for_days: "90",
      max_access_valid_for_days_reconfirmation: "730",
    },
  ],
};
