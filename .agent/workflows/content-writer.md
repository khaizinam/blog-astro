---
description: Skill content-writer - pipeline viet bai SEO cho du an Astro blog. Goi bang /content-writer
---

# Skill: Content Writer Pipeline

Khi nhan yeu cau viet bai SEO moi, LUON thuc hien day du cac buoc sau theo thu tu. Khong duoc bo buoc. Moi buoc phai co output cu the truoc khi sang buoc tiep.

---

## Buoc 1: Research - Nghien cuu chu de va thi truong

### 1.1 Xac dinh doi tuong doc (User Persona)

Tra loi 4 cau hoi truoc khi lam bat ky dieu gi:

1. **Ai se search bai nay?** (chu shop, khach mua hang, dev, sinh vien...)
2. **Ho dang o dau trong pheu mua hang?** (chua biet van de / dang tim hieu / sap mua / da mua can ho tro)
3. **Ho se go tu gi tren Google?** (dung ngon ngu cua HO, khong phai ngon ngu chuyen gia)
4. **Ho co biet cac thuat ngu chuyen mon khong?** (VD: chu shop nho co biet "SEO", "entity", "schema" khong?)

Output: 1 doan mo ta user persona (3-5 dong).

### 1.2 Search web de kiem tra thuc te

Dung tool `search_web` de:
- Tim bai viet dang rank top 5 cho tu khoa muc tieu
- Doc 2-3 bai de hieu content gap (ho thieu gi, minh bo sung gi)
- Kiem tra xem co bai nao tuong tu trong repo chua (tranh cannibal)

```bash
# Kiem tra bai trung trong repo
grep -rl "TU_KHOA_CHINH" /var/www/blog.khaizinam/src/content/posts/vi/
```

### 1.3 Phan tich user behavior va search intent

Phan loai search intent cua chu de:

| Intent | Dau hieu | Vi du |
|---|---|---|
| Informational | "la gi", "cach", "huong dan", "tai sao" | "cach phoi ao khoac denim" |
| Commercial | "tot nhat", "so sanh", "review", "nen mua" | "sneaker trang nu duoi 500K" |
| Transactional | "mua", "gia", "khuyen mai", "dat hang" | "mua ao thun basic cotton" |
| Navigational | ten brand, ten san pham cu the | "Canifa ao thun basic" |

Output: Ghi ro intent chinh + intent phu cua bai viet.

---

## Buoc 2: Keyword Research - Tu khoa va do kha thi

### 2.1 Chon tu khoa

- **Tu khoa chinh**: 1 tu, dat trong title, H1, meta description, mo bai
- **Tu khoa phu**: 3-5 tu, rai tu nhien trong H2/H3 va body
- **Long-tail**: 5-10 cau hoi cu the ma khach co the search

Nguyen tac: shop nho nen nham **long-tail** (3-5 tu) thay vi head term (1-2 tu). VD: "vay cong so nguoi thap 155cm" thay vi "vay cong so".

### 2.2 Kiem tra do kha thi cua title

Truoc khi viet, kiem tra:

1. **Do dai**: title < 60 ky tu (Bing cat tai 60-65, Google cat tai 55-60)
2. **Chua tu khoa chinh** o dau title
3. **Khong trung** voi title bai da co trong repo:

```bash
# Kiem tra title da co
grep -h "^title:" /var/www/blog.khaizinam/src/content/posts/vi/*.md | sort
```

4. **Search intent phu hop**: title phai khop voi nhung gi user thuc su search
5. **De xuat 2-3 phuong an** title, dem ky tu, phan tich uu nhuoc

Output: Bang so sanh 2-3 title candidates voi so ky tu va phan tich.

---

## Buoc 3: Doc Sitemap va chuan bi Internal Link

### 3.1 Scan toan bo bai viet hien co

```bash
# Lay danh sach tat ca slug hien co
grep -h "^slug:" /var/www/blog.khaizinam/src/content/posts/vi/*.md | sed 's/slug: //' | sort
```

### 3.2 Tim bai lien quan de internal link

```bash
# Tim bai co cung tag hoac chu de lien quan
grep -rl "TU_KHOA_LIEN_QUAN" /var/www/blog.khaizinam/src/content/posts/vi/ --include="*.md"
```

### 3.3 Cau truc internal link bat buoc

Moi bai viet PHAI co it nhat:
- **1 link "Xem them"** dang blockquote o dau bai (sau section 1)
- **1 link cross-reference** trong body (khi nhac den chu de lien quan)
- **1 link "Xem them" hoac "Doc bai lien quan"** o cuoi bai hoac trong phan output vi du

Cac kieu hook internal link:

| Kieu | Vi du | Vi tri |
|---|---|---|
| Xem them (blockquote) | `> Xem them: bai [ten bai](/slug) co workflow...` | Sau section 1 |
| In-context reference | `...day cung la ly do bai [ten bai](/slug) nhan manh...` | Giua body |
| So sanh cross-niche | `> Neu ban muon xem vi du cho nganh khac, bai [ten](/slug) co...` | Sau output vi du |
| CTA cuoi bai | `Doc them: [ten bai](/slug)` | Truoc Ket luan |

**QUAN TRONG**: Chi link toi slug THUC SU TON TAI trong repo. Khong bao gio tao markdown link toi URL khong co. Neu can dua vi du URL (danh muc, san pham), dung backtick code inline thay vi markdown link.

```markdown
# DUNG - link toi bai that
[ten bai](/slug-that-ton-tai)

# DUNG - vi du URL dung code inline
Xem danh muc tai `/danh-muc/ao-khoac/`

# SAI - link toi URL khong ton tai
[Ao khoac denim](/danh-muc/ao-khoac-denim)
```

### 3.4 Xac nhan link ton tai

Sau khi viet xong, CHAY LENH nay de kiem tra:

```bash
# Lay tat ca markdown link noi bo trong bai
grep -noP '\[.*?\]\(/[^#)]+\)' BAI_VIET.md

# Voi moi slug tim duoc, kiem tra ton tai
for slug in SLUG1 SLUG2; do
  if [ -f "/var/www/blog.khaizinam/src/content/posts/vi/${slug}.md" ]; then
    echo "OK: ${slug}"
  else
    echo "BROKEN: ${slug}"
  fi
done
```

---

## Buoc 4: Viet bai

### 4.1 Cau truc bai chuan

```
---
title: "..." (< 60 ky tu)
author: "Nguyen Huu Khai - khaizinam"
pubDatetime: YYYY-MM-DDT00:00:00.000Z
slug: slug-bai-viet
lang: vi
translationKey: post-XXX
featured: false
draft: false
tags:
  - "Tag1"
  - "Tag2"
ogImage: "https://cdn.khaizinam.io.vn/blog-folder/YYYY-MM/ten-anh.webp"
description: "..." (140-160 ky tu)
---

### Tieu de chinh (giong title, co the dai hon)

![Alt text mo ta anh](URL_ANH)

Mo bai ngan (1-2 cau) - tom tat gia tri bai viet.

Doan mo bai dai (2-3 doan) - di thang vao van de, giong ca nhan E-E-A-T.

Noi dung bai viet:

* [1. Section 1](#1-section-1)
* [2. Section 2](#2-section-2)
* ...
* [10. FAQ](#10-faq)

---

#### 1. Section 1
(Noi dung)

> Xem them: [ten bai lien quan](/slug) co...

...

#### 10. FAQ

##### Cau hoi 1?
Tra loi.

##### Cau hoi 2?
Tra loi.

#### Ket luan
(2-3 doan tom tat)
```

### 4.2 Nguyen tac viet noi dung

1. **Mo bai**: Di thang vao van de khach gap, KHONG viet kieu "X la mot trong nhung... pho bien..."
2. **Giong van**: Nhu chuyen gia tu van, khong phai AI. Co kinh nghiem thuc te.
3. **E-E-A-T**: Mo bai co giong ca nhan: "Minh da build website cho...", "Sau X nam quan sat..."
4. **3 cau hoi tu van truoc prompt**:
   - Khach hay hoi sai/nham gi nhat?
   - Loi pho bien nhat khi tu mua ma khong hoi shop?
   - Shop co uu diem gi so voi shop khac?
5. **Bang tu van**: Moi bai nen co it nhat 1 bang so sanh/tu van cu the
6. **Vi du output that**: Phai co section "Vi du output thuc te" voi:
   - Input prompt day du
   - Output AI tao ra (title, meta, slug, mo bai, bang)
   - Phan tich tai sao output tot
   - Ghi ro "fictional shop" neu la vi du gia dinh
7. **Context that**: Blockquote giai thich tai sao context that quan trong
8. **Prompt thumbnail**: Moi bai nen co prompt tao anh thumbnail

### 4.3 Nhung thu KHONG duoc lam

- KHONG dung em-dash (—) hoac en-dash (–) - dung dau gach ngang thuong (-)
- KHONG dung smart quotes (" ") - dung straight quotes ("")
- KHONG dung ellipsis (…) - dung ba dau cham (...)
- KHONG bua so lieu tim kiem, gia ca, thong so ky thuat
- KHONG tao markdown link toi URL khong ton tai
- KHONG viet mo bai chung chung kieu "X la mot trong nhung thu pho bien..."
- KHONG lap di lap lai 1 vi du duy nhat cho toan bai

---

## Buoc 5: Audit bai viet

### 5.1 Checklist ky tu dac biet (Emdash Cleanup)

Sau khi viet xong, CHAY LENH:

```bash
FILE="duong-dan-bai-viet.md"

echo "=== Em-dash ===" && grep -c '—' "$FILE" || echo "0"
echo "=== En-dash ===" && grep -c '–' "$FILE" || echo "0"
echo "=== Smart quotes ===" && grep -cP '[\x{201C}\x{201D}\x{2018}\x{2019}]' "$FILE" || echo "0"
echo "=== Ellipsis ===" && grep -c '…' "$FILE" || echo "0"
```

Neu tim thay bat ky dau nao, thay the:

```bash
sed -i 's/—/ - /g; s/–/-/g' "$FILE"
```

### 5.2 Kiem tra meta SEO

```bash
FILE="duong-dan-bai-viet.md"

echo "=== Title length ==="
sed -n '2p' "$FILE" | sed 's/title: "//;s/"//' | tr -d '\n' | wc -m

echo "=== Description length ==="
grep '^description:' "$FILE" | sed 's/description: "//;s/"//' | tr -d '\n' | wc -m
```

Chuan:
- Title: < 60 ky tu (ly tuong 50-58)
- Description: 140-160 ky tu
- Slug: chi chua a-z, 0-9, dau gach ngang

### 5.3 Kiem tra internal link

```bash
FILE="duong-dan-bai-viet.md"

echo "=== All internal markdown links ==="
grep -noP '\[.*?\]\(/[^#)]+\)' "$FILE"

echo "=== Verify existence ==="
for slug in $(grep -oP '\]\(/([^#)]+)\)' "$FILE" | sed 's/\](\/\|)//g'); do
  if [ -f "/var/www/blog.khaizinam/src/content/posts/vi/${slug}.md" ]; then
    echo "OK: ${slug}"
  else
    echo "BROKEN: ${slug}"
  fi
done
```

Neu co link BROKEN, phai fix ngay truoc khi publish.

### 5.4 Kiem tra cau truc

- [ ] Co muc luc clickable (anchor links)?
- [ ] Co it nhat 1 bang tu van/so sanh?
- [ ] Co phan "Vi du output thuc te"?
- [ ] Co FAQ (it nhat 5 cau)?
- [ ] Co CTA cuoi bai?
- [ ] Co "Xem them" cross-link toi bai that?
- [ ] Co blockquote "tai sao context that quan trong"?
- [ ] Mo bai co giong ca nhan (E-E-A-T)?

---

## Buoc 6: Cham diem SEO va Content

Sau khi audit, cham diem bai viet theo 10 tieu chi. Moi tieu chi 10 diem, tong 100.

| # | Tieu chi | Diem chuan | Cach cham |
|---|---|---|---|
| 1 | **Tu khoa** | 10 | Tu khoa chinh trong title, H1, meta, mo bai. Co tu khoa phu trong H2/H3. Da dang vi du san pham (khong chi 1 loai). |
| 2 | **Content depth** | 10 | Co giai thich co che/ly do (why), khong chi liet ke. Co phan "nguyen tac chung", "3 cau tu van". Co blockquote context. |
| 3 | **Huu dung cho nguoi tim kiem** | 10 | Nguoi doc xong BIET lam gi tiep. Moi section co action item. Vi du da dang (nhieu loai san pham/nganh). |
| 4 | **All-in-one** | 10 | Co muc luc, prompt (3 loai: research, viet bai, Codex), output vi du, sitemap, internal link, lich viet, checklist, FAQ. |
| 5 | **Ngan gon xuc tich** | 10 | Khong lap y. Moi doan co gia tri moi. Ngan vi gon, khong phai vi thieu. |
| 6 | **Thuc chien** | 10 | Prompt co vi du dien san. Output co phan tich "tai sao tot". Co action item. Lich viet cu the. |
| 7 | **Du lieu that** | 10 | Ten san pham/brand that. So lieu co nguon. Ghi ro "fictional" khi la vi du gia dinh. |
| 8 | **Output that** | 10 | Vi du output day du (title, meta, slug, mo bai, bang, CTA). Co phan tich. Ghi ro la fictional. |
| 9 | **FAQ** | 10 | It nhat 5 FAQ. Co FAQ rieng nganh (khong chi FAQ chung). Cau hoi tu search intent that. |
| 10 | **Internal link** | 10 | 0 link broken. It nhat 2 cross-link toi bai that. Link dat dung vi tri (blockquote, in-context, cuoi bai). Vi du URL dung code inline. |

**Quy tac diem**:
- 90-100: Xuat sac, san sang publish
- 70-89: Tot, can chinh nho
- 50-69: Trung binh, can bo sung nhieu section
- Duoi 50: Can viet lai

Output: Bang diem 10 tieu chi + tong diem + ghi chu can sua (neu co).

---

## Buoc 7: Tong ket va ban giao

Sau khi bai dat >= 70 diem, tao bao cao ngan:

```
## Bai viet hoan thanh

- **File**: [ten-file.md](file:///duong-dan)
- **Title**: "..." (XX ky tu)
- **Description**: "..." (XX ky tu)
- **Slug**: slug-bai-viet
- **Internal links**: X link valid, 0 broken
- **Diem SEO**: XX/100
- **Dac biet khong co**: em-dash, en-dash, smart quotes, ellipsis
- **Cross-link toi**: [bai 1](/slug1), [bai 2](/slug2)
```

---

## Phu luc: Cac lenh shell thuong dung

```bash
# Dem tat ca bai viet vi
ls /var/www/blog.khaizinam/src/content/posts/vi/ | wc -l

# Lay danh sach slug
grep -h "^slug:" /var/www/blog.khaizinam/src/content/posts/vi/*.md | sed 's/slug: //'

# Lay danh sach tag
grep -h "^  - " /var/www/blog.khaizinam/src/content/posts/vi/*.md | sort -u

# Tim bai theo tag
grep -rl '"SEO"' /var/www/blog.khaizinam/src/content/posts/vi/

# Tim bai theo tu khoa trong content
grep -rl "TU_KHOA" /var/www/blog.khaizinam/src/content/posts/vi/

# Kiem tra tat ca title length
for f in /var/www/blog.khaizinam/src/content/posts/vi/*.md; do
  title=$(sed -n '2p' "$f" | sed 's/title: "//;s/"$//')
  len=$(echo -n "$title" | wc -m)
  if [ "$len" -gt 60 ]; then
    echo "VUOT: $len - $title"
  fi
done

# Kiem tra tat ca description length
for f in /var/www/blog.khaizinam/src/content/posts/vi/*.md; do
  desc=$(grep '^description:' "$f" | sed 's/description: "//;s/"$//')
  len=$(echo -n "$desc" | wc -m)
  if [ "$len" -gt 160 ] || [ "$len" -lt 140 ]; then
    echo "CHECK ($len): $(basename $f)"
  fi
done

# Tim tat ca broken internal links trong 1 bai
grep -oP '\]\(/([^#)]+)\)' BAI.md | sed 's/\](\/\|)//g' | while read slug; do
  [ ! -f "/var/www/blog.khaizinam/src/content/posts/vi/${slug}.md" ] && echo "BROKEN: $slug"
done

# Xoa emdash + endash toan bo 1 file
sed -i 's/—/ - /g; s/–/-/g' FILE.md

# Kiem tra ky tu dac biet AI
grep -cP '[—–…\x{201C}\x{201D}\x{2018}\x{2019}]' FILE.md
```
