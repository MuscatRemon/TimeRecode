import { useState, useEffect } from "react";
import { supabase } from "./utils/supabase";
import { Title } from "./components/Title";
import { InputText } from "./components/InputText";
import { InputTime } from "./components/InputTime";

export function TimeRecode() {
  const [records, setRecords] = useState([]);
  const [inputText, setInputText] = useState("");
  const [inputTime, setInputTime] = useState("0");
  const [allTime, setAllTime] = useState(0);
  const [isAlert, setIsAlert] = useState(false);
  const [isNumber, setIsNumber] = useState(false);
  const databaseName = "study-record";

  useEffect(() => {
    renderingRecord();
  }, []);

  const onChangeText = (e) => {
    setInputText(e.target.value);
  };

  const onChangeTime = (e) => {
    if (!Number(e.target.value)) {
      setIsNumber(true);
      setInputTime(e.target.value);
    } else {
      setIsNumber(false);
      setInputTime(e.target.value);
    }
  };

  const onClickRegistration = async () => {
    if (!inputText || !inputTime || inputTime == "0" || isNumber) {
      setIsAlert(true);
      return;
    }

    await insertRecords(inputText, inputTime);
    renderingRecord();
    setInputText("");
    setInputTime("0");
    setIsAlert(false);
  };

  const getRecords = async () => {
    const { data: studyRecord, error } = await supabase
      .from(databaseName)
      .select("*");

    if (error) {
      console.error(error);
    }

    return studyRecord;
  };

  const renderingRecord = async () => {
    const studyRecord = await getRecords();
    setRecords(studyRecord);
    const sumTime = studyRecord.reduce((sum, item) => sum + item.time, 0);
    setAllTime(sumTime);
  };

  const insertRecords = async (inputText, inputTime) => {
    const { error } = await supabase
      .from(databaseName)
      .insert({ title: inputText, time: inputTime });

    if (error) {
      console.error(error);
    } else {
      console.log(`登録しました`);
    }
  };

  const onClickDeleteRecord = async (recordId) => {
    if (!confirm("本当に削除しますか？")) {
      console.log("キャンセルしました");
      return;
    }

    const response = await supabase
      .from(databaseName)
      .delete()
      .eq("id", recordId);

    if (response.status === 204) {
      console.log("削除しました");
    }

    await renderingRecord();
  };

  return (
    <div>
      <Title>学習記録一覧build自動化</Title>
      <InputText inputText={inputText} onChangeText={onChangeText}>
        学習内容
      </InputText>
      <InputTime inputTime={inputTime} onChangeTime={onChangeTime}>
        学習時間
      </InputTime>
      <div>入力されている学習内容：{inputText}</div>
      <div>入力されている時間：{inputTime}時間</div>
      {records.map((recode) => (
        <div key={recode.id}>
          {recode.title} {recode.time}時間
          <button onClick={() => onClickDeleteRecord(recode.id)}>削除</button>
        </div>
      ))}
      <button onClick={onClickRegistration}>登録</button>
      {isAlert && (
        <div style={{ color: "red" }}>入力されていない項目があります</div>
      )}
      {isNumber && (
        <div style={{ color: "red" }}>
          学習時間は1以上の数値を入力してください
        </div>
      )}
      <div>合計時間：{allTime} / 1000(h)</div>
    </div>
  );
}
