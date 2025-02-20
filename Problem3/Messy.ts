interface WalletBalance {
    currency: string;
    blockchain: string;
    amount: number;
  }
  
  interface FormattedWalletBalance extends WalletBalance {
    formatted: string;
  }
  
  interface Props extends BoxProps {}
  
  const WalletPage: React.FC<Props> = (props: Props) => {
    const { children, ...rest } = props;
    const balances = useWalletBalances();
    const prices = usePrices();
  
    // Hàm tính thứ tự ưu tiên
    const getPriority = (blockchain: string): number => {
      const priorities: { [key: string]: number } = {
        Osmosis: 100,
        Ethereum: 50,
        Arbitrum: 30,
        Zilliqa: 20,
        Neo: 20,
      };
      return priorities[blockchain] || -99;
    };
  
    // Lọc và sắp xếp balances
    const sortedBalances = useMemo(() => {
      return balances
        .filter((balance) => {
          const priority = getPriority(balance.blockchain);
          return priority > -99 && balance.amount > 0;
        })
        .sort((lhs, rhs) => {
          const leftPriority = getPriority(lhs.blockchain);
          const rightPriority = getPriority(rhs.blockchain);
          return rightPriority - leftPriority;
        });
    }, [balances]);
  
    // Định dạng balances
    const formattedBalances = useMemo(() => {
      return sortedBalances.map((balance) => ({
        ...balance,
        formatted: balance.amount.toFixed(),
      }));
    }, [sortedBalances]);
  
    // Render danh sách hàng (rows)
    const rows = formattedBalances.map((balance) => {
      const usdValue = prices[balance.currency] * balance.amount;
      return (
        <WalletRow
          className={classes.row}
          key={balance.currency} // Sử dụng currency làm key
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted}
        />
      );
    });
  
    return <div {...rest}>{rows}</div>;
  };

  /*
  -- Chi tiết sửa lỗi --
Khai báo blockchain trong WalletBalance:

Thêm blockchain: string để hàm getPriority hoạt động chính xác.
Sửa logic trong filter:

Lọc các balances có thứ tự ưu tiên hợp lệ (> -99) và số dư dương (> 0).
Loại bỏ dependency không cần thiết trong useMemo:

Xóa prices khỏi useMemo của sortedBalances.
Thêm useMemo cho formattedBalances:

Bọc logic định dạng vào useMemo để tránh tính toán lại không cần thiết.
Sửa key khi render danh sách:

Thay key={index} bằng key={balance.currency} để đảm bảo tính duy nhất.
Tối ưu hóa hàm getPriority:

Dùng object priorities để tra cứu giá trị thay vì sử dụng switch.

*/