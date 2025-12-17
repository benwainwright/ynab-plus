export const mockGocardlessData = {
  secretId: "secret-id",
  secretKey: "secret-key",
  mockToken: "the-token",
  mockRefreshedToken: "the-refreshed-token",
  mockRefreshToken: "the-refresh-token",
  mockRedirectUrl: "http://www.yourwebpage.com",
  mockAccountDetailsResponses: {
    foo: {
      account: {
        resourceId: "foo",
        iban: "string",
        currency: "string",
        ownerName: "string",
        name: "the name",
        product: "string",
        cashAccountType: "string",
        additionalAccountData: {
          secondaryIdentification: "string"
        }
      }
    },
    bar: {
      account: {
        resourceId: "bar",
        iban: "string",
        currency: "string",
        ownerName: "string",
        details: "foo-details",
        name: "the name",
        product: "string",
        cashAccountType: "string",
        additionalAccountData: {
          secondaryIdentification: "string"
        }
      }
    }
  },
  mockAccountId: "foo",
  mockBalancesResponse: {
    balances: [
      {
        balanceAmount: {
          amount: "657.49",
          currency: "string"
        },
        balanceType: "string",
        referenceDate: "2021-11-22"
      },
      {
        balanceAmount: {
          amount: "185.67",
          currency: "string"
        },
        balanceType: "string",
        referenceDate: "2021-11-19"
      }
    ]
  },
  mockRequisitionResponse: {
    id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    created: "2025-05-14T11:05:56.276Z",
    redirect: "http://www.yourwebpage.com",
    status: "CR",
    institution_id: "string",
    agreement: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    reference: "string",
    accounts: [],
    user_language: "EN",
    link: "https://ob.gocardless.com/psd2/start/3fa85f64-5717-4562-b3fc-2c963f66afa6/{$INSTITUTION_ID}",
    ssn: "string",
    account_selection: false,
    redirect_immediate: false
  },

  mockInstititionsList: [
    {
      id: "ABNAMRO_ABNAGB2LXXX",
      name: "ABN AMRO Bank Commercial",
      bic: "ABNAGB2LXXX",
      transaction_total_days: "540",
      countries: ["GB"],
      logo: "https://storage.googleapis.com/gc-prd-institution_icons-production/UK/PNG/abnamrobank.png",
      max_access_valid_for_days: "90",
      max_access_valid_for_days_reconfirmation: "730"
    },
    {
      id: "REVOLUT_REVOGB21",
      name: "Revolut",
      bic: "REVOGB21",
      transaction_total_days: "730",
      countries: ["GB"],
      logo: "https://storage.googleapis.com/gc-prd-institution_icons-production/UK/PNG/revolut.png",
      max_access_valid_for_days: "90",
      max_access_valid_for_days_reconfirmation: "730"
    }
  ]
};
