use hex::{decode, encode};
use near_sdk::{
    env::{self, block_timestamp},
    log, near, require,
    store::IterableMap,
    AccountId, PanicOnDefault,
};

use dcap_qvl::verify;
use serde_json::json;

mod collateral;

#[near(serializers = [json, borsh])]
#[derive(Clone)]
pub struct Tee {
    checksum: String,
    image_hash: String,
}

#[near(contract_state)]
#[derive(PanicOnDefault)]
pub struct Contract {
    pub owner_id: AccountId,
    pub verified_by_account_id: IterableMap<AccountId, Tee>,
}

#[near]
impl Contract {
    #[init]
    #[private]
    pub fn init(owner_id: AccountId) -> Self {
        Self {
            owner_id,
            verified_by_account_id: IterableMap::new(b"a"),
        }
    }

    // owner methods

    pub fn owner_only(&mut self) {
        require!(env::predecessor_account_id() == self.owner_id);

        log!("hello owner");
    }

    pub fn verify_quote(
        &mut self,
        quote_hex: String,
        collateral: String,
        checksum: String,
        image_hash: String,
    ) -> bool {
        let collateral = collateral::get_collateral(collateral);
        let quote = decode(quote_hex).unwrap();
        let now = block_timestamp() / 1000000000;
        let result = verify::verify(&quote, &collateral, now);

        log!("{:?}", result);

        if result.ok().is_some() {
            let predecessor = env::predecessor_account_id();
            self.verified_by_account_id.insert(
                predecessor,
                Tee {
                    checksum,
                    image_hash,
                },
            );
            return true;
        }
        false
    }

    pub fn get_tee(&self, account_id: AccountId) -> Tee {
        self.verified_by_account_id
            .get(&account_id)
            .unwrap()
            .to_owned()
    }
}
