-- =====================================================================
-- Seed default Flex Message templates for มองดึก KC.
-- Run after schema.sql once.
-- =====================================================================

insert into public.flex_templates (name, kind, is_default, content)
values
  (
    'ค่าเริ่มต้น - ยืนยันสำเร็จ',
    'success',
    true,
    '{
      "type": "bubble",
      "size": "mega",
      "styles": {
        "header": { "backgroundColor": "#8B1A23" },
        "body":   { "backgroundColor": "#FFF8E7" },
        "footer": { "backgroundColor": "#FFF8E7" }
      },
      "header": {
        "type": "box",
        "layout": "vertical",
        "contents": [
          { "type": "text", "text": "ตรวจสลิปสำเร็จ", "color": "#FFF8E7", "weight": "bold", "size": "lg", "align": "center" },
          { "type": "text", "text": "มองดึก KC", "color": "#F5E6A8", "size": "sm", "align": "center", "margin": "sm" }
        ],
        "paddingAll": "16px"
      },
      "body": {
        "type": "box",
        "layout": "vertical",
        "spacing": "md",
        "contents": [
          { "type": "text", "text": "ขอบคุณค่ะ ได้รับสลิปเรียบร้อยแล้ว", "wrap": true, "color": "#2A1416", "size": "md" },
          { "type": "separator", "color": "#EFE0BC" },
          {
            "type": "box", "layout": "vertical", "spacing": "sm",
            "contents": [
              {
                "type": "box", "layout": "baseline", "spacing": "sm",
                "contents": [
                  { "type": "text", "text": "ยอดเงิน", "color": "#6B4A4D", "size": "sm", "flex": 2 },
                  { "type": "text", "text": "{{amount}} บาท", "color": "#8B1A23", "size": "md", "weight": "bold", "flex": 5 }
                ]
              },
              {
                "type": "box", "layout": "baseline", "spacing": "sm",
                "contents": [
                  { "type": "text", "text": "จาก", "color": "#6B4A4D", "size": "sm", "flex": 2 },
                  { "type": "text", "text": "{{sender_name}}", "color": "#2A1416", "size": "sm", "flex": 5, "wrap": true }
                ]
              },
              {
                "type": "box", "layout": "baseline", "spacing": "sm",
                "contents": [
                  { "type": "text", "text": "วันที่", "color": "#6B4A4D", "size": "sm", "flex": 2 },
                  { "type": "text", "text": "{{date}}", "color": "#2A1416", "size": "sm", "flex": 5 }
                ]
              },
              {
                "type": "box", "layout": "baseline", "spacing": "sm",
                "contents": [
                  { "type": "text", "text": "เลขอ้างอิง", "color": "#6B4A4D", "size": "xs", "flex": 2 },
                  { "type": "text", "text": "{{trans_ref}}", "color": "#6B4A4D", "size": "xs", "flex": 5, "wrap": true }
                ]
              }
            ]
          }
        ]
      },
      "footer": {
        "type": "box", "layout": "vertical",
        "contents": [
          { "type": "text", "text": "ทีมงานจะรีบจัดส่งให้นะคะ", "color": "#5BB8E8", "size": "sm", "align": "center" }
        ]
      }
    }'::jsonb
  ),
  (
    'ค่าเริ่มต้น - สลิปซ้ำ',
    'duplicate',
    true,
    '{
      "type": "bubble",
      "size": "mega",
      "styles": {
        "header": { "backgroundColor": "#E8B35B" },
        "body":   { "backgroundColor": "#FFF8E7" }
      },
      "header": {
        "type": "box", "layout": "vertical",
        "contents": [
          { "type": "text", "text": "สลิปนี้ถูกใช้ไปแล้ว", "color": "#2A1416", "weight": "bold", "size": "lg", "align": "center" }
        ],
        "paddingAll": "16px"
      },
      "body": {
        "type": "box", "layout": "vertical", "spacing": "md",
        "contents": [
          { "type": "text", "text": "ระบบตรวจพบว่าสลิปนี้เคยถูกส่งเข้ามาแล้วนะคะ หากเป็นการสั่งซื้อใหม่ รบกวนส่งสลิปการโอนล่าสุดให้ดูค่ะ", "wrap": true, "color": "#2A1416", "size": "md" },
          { "type": "separator", "color": "#EFE0BC" },
          {
            "type": "box", "layout": "baseline", "spacing": "sm",
            "contents": [
              { "type": "text", "text": "เลขอ้างอิง", "color": "#6B4A4D", "size": "xs", "flex": 2 },
              { "type": "text", "text": "{{trans_ref}}", "color": "#6B4A4D", "size": "xs", "flex": 5, "wrap": true }
            ]
          }
        ]
      }
    }'::jsonb
  ),
  (
    'ค่าเริ่มต้น - ตรวจไม่ผ่าน',
    'error',
    true,
    '{
      "type": "bubble",
      "size": "mega",
      "styles": {
        "header": { "backgroundColor": "#B23A3A" },
        "body":   { "backgroundColor": "#FFF8E7" }
      },
      "header": {
        "type": "box", "layout": "vertical",
        "contents": [
          { "type": "text", "text": "ตรวจสลิปไม่สำเร็จ", "color": "#FFF8E7", "weight": "bold", "size": "lg", "align": "center" }
        ],
        "paddingAll": "16px"
      },
      "body": {
        "type": "box", "layout": "vertical", "spacing": "md",
        "contents": [
          { "type": "text", "text": "ขออภัยค่ะ ระบบไม่สามารถอ่านสลิปนี้ได้ รบกวนถ่ายภาพให้ชัด หรือส่งภาพต้นฉบับจากแอปธนาคารอีกครั้งนะคะ", "wrap": true, "color": "#2A1416", "size": "md" },
          { "type": "text", "text": "{{error}}", "color": "#B23A3A", "size": "xs", "wrap": true, "margin": "md" }
        ]
      }
    }'::jsonb
  )
on conflict do nothing;
