export interface Bet {
  id: string;
  AllBets: { [key: string]: boolean };
  BetID: number;
  Date: any; // Use 'any' or 'Timestamp'
  Income: number;
  Interest: number;
  Result: boolean;
  TotalBet: number;
  UserId: string;
  showAllBets?: boolean;
}
