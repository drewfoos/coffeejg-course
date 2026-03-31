const fs = require("fs");
const assets = JSON.parse(fs.readFileSync("./data/assets.json", "utf-8"));

const imageMap = {
  // Booth batch 1
  "https://booth.pm/en/items/8145620": "https://booth.pximg.net/c/620x620/97893da8-e1f8-41ab-b121-5fa2e139c19d/i/8145620/214910dc-862a-4472-b66d-0a0ef38aa1a2_base_resized.jpg",
  "https://booth.pm/en/items/8140762": "https://booth.pximg.net/c/620x620/3547f830-4397-4993-a7b5-459eb4a442ba/i/8140762/a0ebf873-4d6c-4112-ba55-1dcbd1974db8_base_resized.jpg",
  "https://booth.pm/en/items/8139359": "https://booth.pximg.net/c/620x620/9c5b43cc-a04d-4f91-94d6-5105d2961921/i/8139359/db8965f6-c5db-422c-8a10-368984576e86_base_resized.jpg",
  "https://booth.pm/en/items/8038939": "https://booth.pximg.net/0e4d4f0d-926e-4e37-ad64-7b22f3e7c651/i/8038939/2fac77ff-1d69-4005-9593-f6f9dce5dbce_base_resized.jpg",
  "https://booth.pm/en/items/8024833": "https://booth.pximg.net/7daadc32-9167-4b8b-844c-8f275714d905/i/8024833/1c2465dd-3a41-4921-9830-231abab50177_base_resized.jpg",
  "https://booth.pm/en/items/8062002": "https://booth.pximg.net/c/620x620/e6cc7e96-c980-4e75-8fc8-3a40306b2245/i/8062002/3a05345a-9dd5-440a-afbf-ec8cb02b1ea7_base_resized.jpg",
  "https://booth.pm/en/items/8145902": "https://booth.pximg.net/c/620x620/086ad515-24c1-48d4-882e-ff0aebb09676/i/8145902/085342f2-f857-4ac6-8ee1-06876716eeb7_base_resized.jpg",
  "https://booth.pm/en/items/8132782": "https://booth.pximg.net/13e54d25-49f9-4f59-b16e-83223245fde3/i/8132782/96d4e589-e748-4284-a864-b9af15dfbc35_base_resized.jpg",
  "https://booth.pm/en/items/8114557": "https://booth.pximg.net/c/620x620/cc338825-fa4c-434d-af23-58c9a38a6fa8/i/8114557/8975688d-4a10-4bcf-8c7c-d71e15207eef_base_resized.jpg",
  "https://booth.pm/en/items/8114894": "https://booth.pximg.net/c/620x620/c1380210-e21b-47f0-9cf7-3f1d9896b0fa/i/8114894/da10e95d-6bad-4c2b-ae66-f046ecab372b_base_resized.jpg",
  "https://booth.pm/en/items/7898022": "https://booth.pximg.net/c/620x620/1404a543-0461-4469-93c9-8789b2e11b57/i/7898022/1d3bd54e-bbf4-4207-8b0a-40f1b29dd729_base_resized.jpg",
  "https://booth.pm/en/items/8091045": "https://booth.pximg.net/c/620x620/e2c65ec4-12ff-42aa-97ef-71f229fd2389/i/8091045/01ed31a2-e4d0-48b1-a07f-add39edf9f2f_base_resized.jpg",
  "https://booth.pm/en/items/8086752": "https://booth.pximg.net/e2c65ec4-12ff-42aa-97ef-71f229fd2389/i/8086752/390aaaa4-74da-471c-bcc4-e403a1e43729_base_resized.jpg",
  "https://booth.pm/en/items/8077401": "https://booth.pximg.net/c/620x620/e2c65ec4-12ff-42aa-97ef-71f229fd2389/i/8077401/ea3dcc47-f24e-4de2-92b0-7d1ab7e73548_base_resized.jpg",
  "https://booth.pm/en/items/8123776": "https://booth.pximg.net/ee56f703-f9ec-4322-b03d-f8b0980fde41/i/8123776/6d35dc46-9658-4a69-bf20-cadddbb972d1_base_resized.jpg",

  // Booth batch 2
  "https://booth.pm/en/items/8127500": "https://booth.pximg.net/e8bc943a-c589-4d7a-b1a5-97ad4d171cad/i/8127500/ccbe03fd-d662-421c-8466-6c00b76076d0_base_resized.jpg",
  "https://booth.pm/en/items/8086561": "https://booth.pximg.net/c/620x620/03773422-0a7a-4561-af3c-96c749d7eb79/i/8086561/c6033bad-544d-432b-9004-86a46c3b1cf0_base_resized.jpg",
  "https://booth.pm/en/items/8015462": "https://booth.pximg.net/a40c3424-12d7-406e-aa4b-c9d42d52fd36/i/8015462/dcba21bf-6598-4ccf-bfb9-079a3361106c_base_resized.jpg",
  "https://booth.pm/en/items/8000321": "https://booth.pximg.net/c/620x620/cc338825-fa4c-434d-af23-58c9a38a6fa8/i/8000321/5f4c7721-37e7-4c77-884e-cd047e4b2440_base_resized.jpg",
  "https://booth.pm/en/items/7978128": "https://booth.pximg.net/ee56f703-f9ec-4322-b03d-f8b0980fde41/i/7978128/34a14774-9a6e-4928-a473-dd26c09bc020_base_resized.jpg",
  "https://booth.pm/en/items/7957497": "https://booth.pximg.net/c/620x620/ba1a247a-f7cd-45cc-93d3-fa5747fb1600/i/7957497/082cb930-cf9c-4629-84e4-a9c8ba807f9f_base_resized.jpg",
  "https://booth.pm/en/items/8146352": "https://booth.pximg.net/0396954c-d030-454b-a23a-62d3f4623015/i/8146352/dde8d75a-b12e-4c45-baca-4e9cd05e6d8c_base_resized.jpg",
  "https://booth.pm/en/items/8145805": "https://booth.pximg.net/c/620x620/e55d2424-9c39-4eec-8582-34b6aa7462ce/i/8145805/94af0183-f6c4-4760-9c84-42755806e92a_base_resized.jpg",
  "https://booth.pm/en/items/7856364": "https://booth.pximg.net/162dc4f5-c1e1-48da-b8a6-d9d688b78b2b/i/7856364/69b2f40c-e85c-43b9-b52d-a3c3620b45ae_base_resized.jpg",
  "https://booth.pm/en/items/7838668": "https://booth.pximg.net/81fa84ec-54f5-4fb4-b736-11ec62fc1d2d/i/7838668/64abf135-cb94-4650-9779-7bb8cfc06be2_base_resized.jpg",
  "https://booth.pm/en/items/7889282": "https://booth.pximg.net/af8bdcdc-ecbf-4f18-9698-5a4767908b72/i/7889282/3c6c7f3d-ee38-4505-a34f-3621d4ca816f_base_resized.jpg",
  "https://booth.pm/en/items/7973883": "https://booth.pximg.net/c/620x620/956244df-f690-437f-8992-2c6a13890627/i/7973883/faec1ebe-ecc6-4861-86f7-28f41ffd5e31_base_resized.jpg",
  "https://booth.pm/en/items/7943001": "https://booth.pximg.net/c/620x620/456f2375-120d-43f0-9347-50e77ca6eae8/i/7943001/cb4a7250-69b5-4dd8-9d02-38c9632d5dcb_base_resized.jpg",
  "https://booth.pm/en/items/7977575": "https://booth.pximg.net/1aa16ceb-f536-4c78-a98d-9485087659f4/i/7977575/235c24c1-e591-4eb4-9b71-37208d4f2b7c_base_resized.jpg",
  "https://booth.pm/en/items/8147071": "https://booth.pximg.net/263d765b-ad67-47fe-91e2-6ed7b1cddb95/i/8147071/3c6a2448-b144-4d42-9b54-4f23ebc63890_base_resized.jpg",

  // Ko-fi
  "https://ko-fi.com/s/88429882d8": "https://storage.ko-fi.com/cdn/useruploads/display/c97bfb38-1b6f-4a4c-be45-4d42793445ce_screenshot2022107134779477.png",
  "https://ko-fi.com/s/39c7b788db": "https://storage.ko-fi.com/cdn/useruploads/display/674d4d9c-190d-4991-8a1e-ebd95f321935_modelpreview2.png",
  "https://ko-fi.com/s/47e5a5e686": "https://storage.ko-fi.com/cdn/useruploads/display/aadf5aa2-6e65-4ad8-91fb-b862e1b5fe63_thumbnail.png",
  "https://ko-fi.com/s/800b46e208": "https://storage.ko-fi.com/cdn/useruploads/display/de0f5f44-a0b1-49e3-840e-513dd3058acd_screenshot_606.png",
  "https://ko-fi.com/s/4debc31c3b": "https://storage.ko-fi.com/cdn/useruploads/display/e749d4a3-7151-45e4-befc-5233c1869741_tsukatavatar1.png",
  "https://ko-fi.com/s/470469a4cc": "https://storage.ko-fi.com/cdn/useruploads/display/2aff7ce9-6118-462e-abaa-cfe25231c139_20.png",
  "https://ko-fi.com/s/06bbeaeef1": "https://storage.ko-fi.com/cdn/useruploads/display/76eb0273-4003-40d2-a44a-25240a30ba16_5fef.png",
  "https://ko-fi.com/s/f8812e3b18": "https://storage.ko-fi.com/cdn/useruploads/display/ad165130-a730-4459-9876-04ae29439856_opts2.png",
  "https://ko-fi.com/s/62b3e91fc4": "https://storage.ko-fi.com/cdn/useruploads/display/5c7fa466-2eca-4bcf-877b-32c51d625819_opts3.png",
  "https://ko-fi.com/s/4ed75e9ade": "https://storage.ko-fi.com/cdn/useruploads/display/723f79ef-75bf-4f15-a9a1-5fcdaf6a324d_opts1.png",
  "https://ko-fi.com/s/4190bc0ab3": "https://storage.ko-fi.com/cdn/useruploads/display/bff8a67c-375b-47d6-a885-50d339573ace_jiangshin_c.png",
  "https://ko-fi.com/s/916e32ceea": "https://storage.ko-fi.com/cdn/useruploads/display/c321c4d3-3e71-4bc2-813e-c17a8cdc9463_25-jan.-25-01-01-02-17.png",
  "https://ko-fi.com/s/cb8849857a": "https://storage.ko-fi.com/cdn/useruploads/display/0ae78620-b725-40bc-8e95-a1456005677c_yippee_thumbnail.png",
  "https://ko-fi.com/s/0cdb5f852b": "https://storage.ko-fi.com/cdn/useruploads/display/81b1c880-2482-4555-b52d-97774e52e50d_chick_teaser.png",

  // Gumroad
  "https://juliawinterpaw.gumroad.com/l/Feline": "https://public-files.gumroad.com/7p95wtppb0kotf318yky3l8y2obv",
  "https://juliawinterpaw.gumroad.com/l/canine": "https://public-files.gumroad.com/yijhjt4hczpeicz2a990ikbv3vai",
  "https://juliawinterpaw.gumroad.com/l/vrchatcanine": "https://public-files.gumroad.com/9nwswdl3ljhfcoev76hxfrme9oj5",
  "https://monadoart.gumroad.com/l/lucariovsf": "https://public-files.gumroad.com/boy4pmqukfktejhje530dysr2brx",
};

let patched = 0;
for (const asset of assets) {
  if (!asset.imageUrl && imageMap[asset.externalUrl]) {
    asset.imageUrl = imageMap[asset.externalUrl];
    patched++;
  }
}

fs.writeFileSync("./data/assets.json", JSON.stringify(assets, null, 2));

const stillMissing = assets.filter(a => !a.imageUrl).length;
console.log(`Patched: ${patched}`);
console.log(`Still missing: ${stillMissing}`);
if (stillMissing > 0) {
  assets.filter(a => !a.imageUrl).forEach(a => console.log(`  - ${a.id}: ${a.externalUrl}`));
}
