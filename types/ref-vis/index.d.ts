// Type definitions for bsv 0.30
// Project: https://github.com/rohenaz/minerva
// Definitions by: Lucas Rohenaz <https://github.com/rohenaz>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare module "ref-vis" {
  export type Tree = {
    children: User[];
  };

  export type User = {
    payout_address: string;
    email: string;
    referred_by_user_id: number;
    children: User[];
    id: number;
  };
}
