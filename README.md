# 貓貓啟示錄 · 緋月之森

遊戲直接在[主網址](https://wcy.hk/meow-revelation/)載入。舊有的 Eclipse 和潮燈祀殿入口會轉到主網址，原有的查詢參數與網址片段會一併保留。遊戲素材與程式模組存放在 eclipse 目錄。

遊戲會依照瀏覽器語言偏好選擇繁體中文、簡體中文、英文或日文。入口可手動切換，偏好保存在裝置。介面文字集中在 `eclipse/locale-catalogue.mjs`，各語言字型跟隨離線資源套件一併下載。

發佈前先暫存遊戲檔案，執行 node tools/build-offline.mjs，再暫存產生的 offline-assets.js。配樂原稿置於 tools/render-score.py。

現行神器、敵人與頭目使用 lantern-designs.mjs、lantern-weapons.mjs 及 lantern-creatures.mjs 的獨立燈契世界設計。舊識別碼只用於相容既有紀錄。歷史造型研究模組保留於版本庫，沒有接入現行模型工廠，也不列入離線包；不要重新引用該等研究模組。神器預製圖卡須透過 tools/smoke-original-world.cjs 的 MEOW_ICON_OUTPUT 模式，由現行手持模型重新輸出。

預設戰鬥配樂為 nene 的 Boss Battle #2 [Symphonic Metal]，使用作者標示 CC0 的循環段；來源、轉檔說明與檔案雜湊見 eclipse/audio/MUSIC-LICENSE.txt。遊戲會移除本遊戲音樂欄位內已停用曲目的已知快取，保留其他自選曲目及遊戲紀錄。
