import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, vi } from "vitest";

let mockDB = [{ id: 1, title: "React", time: 2 }];

vi.mock("../utils/supabase", () => {
  return {
    supabase: {
      from: vi.fn(() => ({
        select: vi.fn().mockImplementation(async () => ({
          data: [...mockDB],
          error: null,
        })),
        insert: vi.fn().mockImplementation(async ({ title, time }) => {
          const newItem = {
            id: mockDB.length + 1,
            title: title,
            time: Number(time),
          };
          mockDB.push(newItem);
          return { data: [...mockDB], error: null };
        }),
        // delete: vi.fn().mockResolvedValue({ status: 204 }),
        delete: vi.fn().mockImplementation(() => {
          return {
            eq: vi.fn(async (field, value) => {
              const mocDBIndex = value - 1;
              mockDB.splice(mocDBIndex, 1); // 削除
              return { status: 204 };
            }),
          };
        }),
      })),
    },
  };
});

import { TimeRecode } from "../TimeRecode";
describe(TimeRecode, async () => {
  test("タイトル表示されているか", () => {
    render(<TimeRecode />);
    // タイトル表示テスト
    expect(screen.getByText("学習記録一覧")).toBeInTheDocument();
  });

  test("バリデーションエラーがでるか", async () => {
    render(<TimeRecode />);

    expect(screen.queryByText("入力されていない項目があります")).toBeNull();

    const register = screen.getByRole("button", { name: "登録" });
    fireEvent.click(register);

    await waitFor(() => {
      expect(
        screen.getByText("入力されていない項目があります")
      ).toBeInTheDocument();
    });
  });

  test("登録&削除の描画がされるか", async () => {
    render(<TimeRecode />);

    const inputStudy = screen.getByLabelText("学習内容");
    fireEvent.change(inputStudy, { target: { value: "テスト学習" } });

    const inputTime = screen.getByLabelText(/学習時間/);
    fireEvent.change(inputTime, { target: { value: 5 } });

    const register = screen.getByRole("button", { name: "登録" });
    fireEvent.click(register);

    await waitFor(() => {
      // screen.debug();
      // 登録クリック後に学習内容と学習時間のinputが初期化されているか
      expect(inputStudy).toHaveValue("");
      expect(inputTime).toHaveValue("0");
      // 画面に追加した学習記録が描画されているか 合計時間が期待通りか
      expect(screen.getByText(/テスト学習.*5時間/)).toBeInTheDocument();
      expect(screen.getByText(/合計時間：7 \/ 1000\(h\)/)).toBeInTheDocument();
    });

    window.confirm = vi.fn().mockReturnValue(true);
    const deleteButtons = await screen.findAllByRole("button", {
      name: "削除",
    });
    fireEvent.click(deleteButtons[1]);

    await waitFor(() => {
      // 削除ボタンクック後に学習記録が画面から削除されているか
      expect(screen.queryByText(/テスト学習.*5時間/)).toBeNull();
    });
  });
});
