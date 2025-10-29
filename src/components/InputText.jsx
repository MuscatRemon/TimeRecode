export const InputText = (props) => {
  const { inputText, onChangeText, children } = props;

  return (
    <div>
      <label>
        {children}
        <input type="text" value={inputText} onChange={onChangeText} />
      </label>
    </div>
  );
};
