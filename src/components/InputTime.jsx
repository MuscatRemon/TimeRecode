export const InputTime = (props) => {
  const { inputTime, onChangeTime, children } = props;

  return (
    <div>
      <label>
        {children}
        <input type="text" value={inputTime} onChange={onChangeTime} />
        時間
      </label>
    </div>
  );
};
