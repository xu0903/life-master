import type { RawTest } from './reading'

// 原創模擬題，題型與題數比照多益閱讀測驗（Part 5–7，共 100 題）。選項第一個是正確答案，載入時會打散。
export const TEST_1: RawTest = {
  id: 'r1',
  name: '模擬試題 1',
  part5: [
    { q: 'Ms. Tanaka will present ------- findings at the quarterly meeting next week.', o: ['her', 'she', 'hers', 'herself'], ex: '名詞 findings 前面要用所有格 her。' },
    { q: 'The new software update is ------- faster than the previous version.', o: ['significantly', 'significant', 'significance', 'signify'], ex: '修飾比較級形容詞 faster 要用副詞 significantly。' },
    { q: 'All employees must submit their expense reports ------- the end of the month.', o: ['by', 'until', 'among', 'into'], ex: 'by 表示「在…之前（完成）」；until 用在持續到某時的動作，submit 是一次性動作。' },
    { q: '------- the heavy rain, the outdoor concert was held as scheduled.', o: ['Despite', 'Although', 'Because', 'Unless'], ex: '空格後是名詞片語 the heavy rain，要用介系詞 Despite；Although 後面要接子句。' },
    { q: "The marketing team is responsible for ------- the company's social media accounts.", o: ['managing', 'manage', 'manages', 'managed'], ex: '介系詞 for 後面接動名詞 managing。' },
    { q: 'Customers who are not ------- satisfied with their purchase may return it within 30 days.', o: ['completely', 'complete', 'completion', 'completing'], ex: '修飾形容詞 satisfied 要用副詞 completely。' },
    { q: 'Mr. Alvarez has worked at the firm ------- more than fifteen years.', o: ['for', 'since', 'during', 'while'], ex: '現在完成式 + for + 一段時間；since 後面接時間點。' },
    { q: 'The conference room on the third floor is ------- than the one on the second floor.', o: ['more spacious', 'spacious', 'most spacious', 'spaciously'], ex: '後面有 than，要用比較級 more spacious。' },
    { q: "Please ------- the attached document before tomorrow's meeting.", o: ['review', 'reviewing', 'reviewed', 'to review'], ex: 'Please 開頭的祈使句用原形動詞 review。' },
    { q: 'The hotel offers a ------- shuttle service to and from the airport.', o: ['complimentary', 'compliment', 'complimenting', 'compliments'], ex: 'complimentary（形容詞）= 免費贈送的，修飾名詞 shuttle service。' },
    { q: 'Neither the manager ------- the assistant was available to answer the call.', o: ['nor', 'or', 'and', 'but'], ex: '固定搭配 neither A nor B（A 和 B 都不）。' },
    { q: 'The shipment ------- by the time we arrived at the warehouse.', o: ['had been delivered', 'has delivered', 'will deliver', 'delivering'], ex: 'by the time + 過去式，主要子句用過去完成式；貨物是「被」送達，所以用被動 had been delivered。' },
    { q: 'Applicants must have at least three years of ------- experience in sales.', o: ['relevant', 'relevance', 'relevantly', 'relate'], ex: '修飾名詞 experience 要用形容詞 relevant（相關的）。' },
    { q: 'The company plans to ------- its operations into Southeast Asia next year.', o: ['expand', 'expend', 'expect', 'expire'], ex: 'expand operations into… = 把業務拓展到…；expend 是花費、expire 是到期。' },
    { q: 'Ms. Chen, ------- was promoted last month, will lead the new project.', o: ['who', 'whom', 'whose', 'which'], ex: '先行詞是人，且在子句中當主詞（was promoted），用主格關係代名詞 who。' },
    { q: 'The museum is open daily ------- on national holidays.', o: ['except', 'without', 'unless', 'besides'], ex: 'except on… = 除了…之外（不包含）；besides 是「除了…還有」。' },
    { q: 'Sales figures rose ------- in the third quarter, exceeding all forecasts.', o: ['sharply', 'sharp', 'sharpen', 'sharpness'], ex: '修飾動詞 rose 要用副詞 sharply（急遽地）。' },
    { q: 'If you have any questions, please do not ------- to contact our help desk.', o: ['hesitate', 'decline', 'postpone', 'resist'], ex: '固定用法 do not hesitate to + 動詞（請不要猶豫、儘管…）。' },
    { q: 'The renovation of the lobby is expected to be ------- by early March.', o: ['completed', 'completing', 'completes', 'completion'], ex: '翻修工程是「被完成」，to be + 過去分詞 completed。' },
    { q: '------- of the two candidates has experience in international trade.', o: ['Neither', 'Both', 'All', 'Few'], ex: '動詞是單數 has，只有 Neither（兩者都不）接單數動詞；Both / Few 要接複數動詞。' },
    { q: 'The manager asked that every report ------- submitted electronically.', o: ['be', 'is', 'was', 'being'], ex: 'ask / request / require that… 後面用原形動詞（省略 should）：be submitted。' },
    { q: 'Due to a scheduling -------, the workshop has been moved to Friday.', o: ['conflict', 'contact', 'contract', 'content'], ex: 'scheduling conflict = 時間衝突（撞期），是常見搭配。' },
    { q: 'The new policy will take ------- on the first of January.', o: ['effect', 'affect', 'effort', 'effective'], ex: 'take effect = 生效。affect 是動詞「影響」。' },
    { q: 'Dr. Patel is ------- regarded as one of the leading experts in her field.', o: ['widely', 'wide', 'widen', 'width'], ex: '修飾過去分詞 regarded 要用副詞；be widely regarded as = 被廣泛認為是。' },
    { q: 'The main entrance will remain closed ------- the renovation work is finished.', o: ['until', 'by', 'during', 'despite'], ex: '空格後是子句，表示「持續到…為止」用連接詞 until；by / during / despite 後面接名詞。' },
    { q: 'Employees are encouraged to take ------- of the on-site fitness center.', o: ['advantage', 'benefit', 'profit', 'interest'], ex: 'take advantage of = 善加利用。' },
    { q: 'The quarterly report, ------- was released yesterday, shows a 10 percent increase in revenue.', o: ['which', 'that', 'what', 'who'], ex: '逗號後的非限定關係子句，先行詞是事物，只能用 which，不能用 that。' },
    { q: "The sales director was pleased with the team's ------- performance this year.", o: ['impressive', 'impress', 'impressed', 'impressively'], ex: '修飾名詞 performance 用形容詞 impressive（令人印象深刻的）；impressed 是「感到佩服的」，用來形容人。' },
    { q: '------- you need any assistance during your stay, please call the front desk.', o: ['Should', 'Would', 'Had', 'Were'], ex: 'Should you need… = If you should need…，是省略 if 的倒裝句。' },
    { q: 'The supplier guaranteed that the parts would arrive ------- three business days.', o: ['within', 'since', 'among', 'toward'], ex: 'within + 一段時間 = 在…之內。' },
  ],
  part6: [
    {
      docs: [
        {
          label: 'Memo',
          text: `To: All Staff
From: Hannah Brooks, Office Manager
Subject: Parking lot resurfacing

The parking lot behind our building will be resurfaced next week. Work is {1} to begin on Monday, May 6, and should take three days. During this time, employees will not be able to park in the lot. {2} A shuttle will run between the garage and our front entrance every fifteen minutes from 7:30 A.M. to 9:30 A.M.

We apologize for any {3} this may cause. If the weather is poor, the work may be {4}; in that case, I will send an update by e-mail.`,
        },
      ],
      qs: [
        { q: '', o: ['scheduled', 'schedule', 'scheduling', 'schedules'], ex: 'be scheduled to + 動詞 = 預定要…，用過去分詞。' },
        {
          q: '',
          o: [
            'Instead, please use the public garage on Oak Street, where spaces have been reserved for us.',
            'The lot was last resurfaced ten years ago.',
            'Employees who cycle to work should use the bicycle racks.',
            'The contractor has offered us a lower price.',
          ],
          ex: '前一句說不能停在停車場，後一句提到 the garage 的接駁車，所以中間要先介紹替代的停車場（garage）。',
        },
        { q: '', o: ['inconvenience', 'inconvenient', 'inconveniently', 'inconvenienced'], ex: 'any 後面接名詞；apologize for any inconvenience = 造成不便敬請見諒。' },
        { q: '', o: ['delayed', 'reduced', 'removed', 'approved'], ex: '天氣不好 → 工程可能「延後」，所以才會再寄信更新時間。' },
      ],
    },
    {
      docs: [
        {
          label: 'E-mail',
          text: `To: Peter Novak
From: Lucy Marsh, Greenfield Office Supply
Subject: Your order

Dear Mr. Novak,

Thank you for your recent order from Greenfield Office Supply. Unfortunately, the Model T-40 desk lamp you ordered is {1} out of stock. We expect to receive a new shipment on June 12. {2} Alternatively, we can send you the Model T-45, which has {3} features, at no additional cost.

Please let us know which option you prefer by replying to this e-mail. {4} we do not hear from you by June 5, we will keep your original order and ship it when the item becomes available.

Sincerely,
Lucy Marsh
Customer Service`,
        },
      ],
      qs: [
        { q: '', o: ['temporarily', 'temporary', 'temporariness', 'temporize'], ex: '修飾 out of stock 這個狀態要用副詞 temporarily（暫時地）。' },
        {
          q: '',
          o: [
            'Your lamp will be shipped to you as soon as it arrives.',
            'Our store opened in 2005.',
            'The lamp is available in three colors.',
            'We have already refunded your payment.',
          ],
          ex: '前一句說 6/12 會到貨，接著說到貨後立刻寄出最通順；下一句 Alternatively 才提出另一個選擇。信末說會保留原訂單，所以不是已退款。',
        },
        { q: '', o: ['similar', 'familiar', 'opposite', 'previous'], ex: '提供替代品，功能應該「相似」：similar features。' },
        { q: '', o: ['If', 'Although', 'Whether', 'Until'], ex: '「如果」6/5 前沒收到回覆，就照原訂單處理，用表條件的 If。' },
      ],
    },
    {
      docs: [
        {
          label: 'Article',
          text: `HARLOW (March 3) — Sweet Crumb Bakery, a local favorite for more than twenty years, announced yesterday that it will open a second {1} on Pine Street this summer. The new shop will be twice as large as the original and will include a seating area for forty customers.

Owner Maria Costa said that the decision was made in response to {2} demand. "Our customers have been asking us to expand for years," she said. {3}

The bakery is currently {4} bakers and counter staff for the new shop. Interested applicants can apply online at www.sweetcrumb.example.`,
        },
      ],
      qs: [
        { q: '', o: ['location', 'occupation', 'situation', 'invitation'], ex: 'open a second location = 開第二家分店。' },
        { q: '', o: ['growing', 'grow', 'grew', 'grows'], ex: '修飾名詞 demand 用現在分詞當形容詞：growing demand（日益增加的需求）。' },
        {
          q: '',
          o: [
            '"We are thrilled to finally be able to do so."',
            '"Prices of flour have risen sharply."',
            '"The original shop will close in June."',
            '"We no longer sell wedding cakes."',
          ],
          ex: '前一句說顧客多年來一直希望他們擴店，接「我們很高興終於能做到」最連貫；do so 指 expand。',
        },
        { q: '', o: ['hiring', 'hired', 'hire', 'hires'], ex: 'is currently + V-ing：現在進行式，正在招募。' },
      ],
    },
    {
      docs: [
        {
          label: 'Notice',
          text: `Notice to Members of Riverside Fitness Center

Beginning July 1, the center will {1} its hours of operation. We will open at 5:00 A.M. instead of 6:00 A.M. on weekdays, giving early risers more time to exercise before work. Weekend hours will remain {2}.

In addition, we are pleased to announce two new evening yoga classes. {3} Space is limited, so we recommend signing up early at the front desk or through our mobile app.

As always, we welcome your feedback. Please share your {4} with any staff member or by e-mail at info@riversidefit.example.`,
        },
      ],
      qs: [
        { q: '', o: ['extend', 'extends', 'extended', 'extending'], ex: '助動詞 will 後面接原形動詞 extend（延長）。' },
        { q: '', o: ['unchanged', 'unfinished', 'unknown', 'unpaid'], ex: '只有平日提早開門，週末時間「維持不變」：remain unchanged。' },
        {
          q: '',
          o: [
            'These classes are free for all current members.',
            'The pool will be closed for cleaning.',
            'Membership fees are due at the start of each month.',
            'Yoga mats can be bought at most sports shops.',
          ],
          ex: '前一句宣布新的瑜珈課，These classes 承接它；後一句「名額有限，請及早報名」也接得上。',
        },
        { q: '', o: ['suggestions', 'suggest', 'suggested', 'suggestive'], ex: '所有格 your 後面接名詞 suggestions，呼應前一句的 feedback。' },
      ],
    },
  ],
  part7: [
    {
      docs: [
        {
          label: 'Advertisement',
          text: `Bright Wash Laundry
Now Open at 45 Market Street!

• Self-service washers and dryers, open 6 A.M. to 11 P.M. daily
• Drop-off service: leave your laundry before 10 A.M. and pick it up the same day
• Free Wi-Fi and coffee while you wait

Grand-opening offer: Bring this flyer before April 30 and get one wash free.`,
        },
      ],
      qs: [
        { q: 'What is being advertised?', o: ['A laundry business', 'A coffee shop', 'A clothing store', 'A cleaning product'], ex: '店名 Bright Wash Laundry，提供自助洗衣與代洗服務。咖啡只是等待時的免費招待。' },
        { q: 'How can customers receive a free wash?', o: ['By presenting the flyer', 'By arriving before 10 A.M.', 'By using the drop-off service', 'By signing up online'], ex: '最後一行：4/30 前帶這張傳單來可免費洗一次。' },
      ],
    },
    {
      docs: [
        {
          label: 'Text-message chain',
          text: `Dana Kim (9:12 A.M.)
Hi Marco. I'm at the client's office, but I left the product samples on my desk. Could you bring them over?

Marco Silva (9:14 A.M.)
Sure. I'm just finishing a call. I can leave in ten minutes.

Dana Kim (9:15 A.M.)
Perfect. The presentation starts at 10, so there's plenty of time.

Marco Silva (9:16 A.M.)
Which building is it again?

Dana Kim (9:17 A.M.)
Halston Tower, 8th floor. Ask for me at reception.

Marco Silva (9:18 A.M.)
Got it. See you soon.`,
        },
      ],
      qs: [
        { q: 'What does Ms. Kim ask Mr. Silva to do?', o: ['Deliver some items', 'Give a presentation', 'Call a client', 'Reserve a meeting room'], ex: '她把樣品忘在桌上，請 Marco 送過去（Could you bring them over?）。' },
        { q: 'At 9:18 A.M., what does Mr. Silva most likely mean when he writes, "Got it"?', o: ['He understands where to go.', 'He has found the samples.', 'He has received a package.', 'He has finished his phone call.'], ex: '他剛問是哪棟大樓，Dana 回答地點後他說 Got it，表示知道要去哪裡了。' },
      ],
    },
    {
      docs: [
        {
          label: 'Notice',
          text: `NOTICE: Elevator Maintenance

The east elevator in Carlton Plaza will be out of service on Thursday, August 8, from 9:00 A.M. to 3:00 P.M. for its annual safety inspection. The west elevator will operate normally.

Tenants expecting large deliveries on that day are advised to reschedule them or contact the building management office at extension 204.`,
        },
      ],
      qs: [
        { q: 'Why will the east elevator be out of service?', o: ['It will undergo a yearly inspection.', 'It will be replaced with a new one.', 'It was damaged during a delivery.', 'The building will be closed.'], ex: 'for its annual safety inspection = 進行年度安全檢查。' },
        { q: 'What are some tenants advised to do?', o: ['Change their delivery arrangements', 'Use the stairs on August 8', 'Work from home on Thursday', 'Pay a maintenance fee'], ex: '當天有大型貨物要送的住戶，建議改期（reschedule）或聯絡管理室。' },
      ],
    },
    {
      docs: [
        {
          label: 'E-mail',
          text: `To: Priya Nair
From: Tom Becker
Date: October 2
Subject: Training session

Dear Priya,

I'm writing to confirm the details of the customer-service training session for new hires. It will take place on October 15 from 1:00 to 4:00 P.M. in Meeting Room B. Twelve employees have registered so far.

Could you please arrange for a projector and order refreshments for the break? Also, the trainer, Ms. Okafor, has asked that handouts be printed in advance. I've attached the file. Please print fifteen copies so that we have a few extras.

Thanks for your help.

Tom`,
        },
      ],
      qs: [
        { q: 'What is the purpose of the e-mail?', o: ['To confirm arrangements for an event', 'To announce a new hiring policy', 'To request feedback on a trainer', 'To cancel a meeting-room booking'], ex: '第一句：I\'m writing to confirm the details of the… training session。' },
        { q: 'What is Ms. Nair asked to do?', o: ['Print some documents', 'Lead a training session', 'Register new employees', 'Find a different room'], ex: '請她安排投影機、訂茶點，並先印好講義（print fifteen copies）。' },
        { q: 'How many people have signed up for the session so far?', o: ['Ten', 'Twelve', 'Fifteen', 'Twenty'], a: 1, keep: true, ex: 'Twelve employees have registered so far；15 是要印的講義份數。' },
      ],
    },
    {
      docs: [
        {
          label: 'Online review',
          text: `Aldo's Bistro ★★★★☆
Posted by Rebecca L.

My colleagues and I had lunch at Aldo's Bistro last Friday to celebrate a coworker's retirement. We had booked a table for eight, and the staff had decorated it nicely before we arrived. The food was excellent—I especially recommend the mushroom risotto. Service was friendly, though our main courses took nearly forty minutes to arrive, which is why I'm not giving five stars. Prices are reasonable for the quality. We'll definitely come back, but next time we'll avoid the busy lunch hour.`,
        },
      ],
      qs: [
        { q: "Why did Rebecca visit Aldo's Bistro?", o: ['To mark a colleague\'s retirement', 'To meet an important client', 'To write a review for a newspaper', 'To celebrate her own promotion'], ex: 'to celebrate a coworker\'s retirement = 慶祝同事退休。' },
        { q: 'What was Rebecca dissatisfied with?', o: ['The wait for the food', 'The size of the table', 'The cost of the meal', 'The attitude of the staff'], ex: '主餐等了將近四十分鐘，所以沒給五顆星。價格她認為合理，服務也友善。' },
        { q: "What is indicated about Aldo's Bistro?", o: ['It accepts reservations.', 'It opened recently.', 'It serves only lunch.', 'It is known for its low prices.'], ex: 'We had booked a table for eight，表示可以訂位。' },
      ],
    },
    {
      docs: [
        {
          label: 'Announcement',
          text: `Holloway Public Library — Volunteer Opportunity

The library is looking for volunteers to help with our Summer Reading Program, which runs from June 20 to August 15. Volunteers read stories to children aged 4 to 8, help them choose books, and assist with craft activities.

No experience is necessary; a two-hour orientation will be provided on June 14. Volunteers must be at least 16 years old and able to commit to a minimum of three hours per week.

To apply, complete the form at the information desk by June 7.`,
        },
      ],
      qs: [
        { q: 'What is a requirement for volunteers?', o: ['Being at least 16 years old', 'Having teaching experience', 'Owning a library card', 'Working every weekend'], ex: 'Volunteers must be at least 16 years old；文中明說不需要經驗。' },
        { q: 'What will happen on June 14?', o: ['A training session will be held.', 'The reading program will begin.', 'Applications will close.', 'A craft fair will take place.'], ex: '6/14 有兩小時的 orientation（行前說明／訓練）。活動 6/20 開始，報名 6/7 截止。' },
        { q: 'How should interested people apply?', o: ['By filling out a form at the library', 'By sending an e-mail', 'By calling the information desk', 'By attending the orientation'], ex: 'complete the form at the information desk = 到服務台填表。' },
      ],
    },
    {
      docs: [
        {
          label: 'Article',
          text: `Nordvik Airlines to Add Routes

OSLO (January 18) — Nordvik Airlines announced today that it will begin flying to three new destinations in the spring: Lisbon, Athens, and Dublin. Flights to Lisbon and Athens will start on April 1, while service to Dublin will begin a month later. —[1]—

The airline, founded only six years ago, has grown quickly by offering low fares on routes that larger carriers often overlook. —[2]— Last year it carried 4.2 million passengers, up 18 percent from the year before.

"Travelers have told us they want more direct connections to southern Europe," said chief executive Ingrid Halvorsen. —[3]— "These routes are our answer."

To support the expansion, Nordvik will lease four additional aircraft and hire about 120 new staff, including pilots and cabin crew. —[4]— Tickets for the new routes go on sale February 1.`,
        },
      ],
      qs: [
        { q: 'What is the article mainly about?', o: ['An airline\'s plans to expand', 'A merger between two carriers', 'A rise in ticket prices', 'The appointment of a new executive'], ex: '標題與全文都在講 Nordvik 新增航線、租飛機、招募員工，也就是擴張計畫。' },
        { q: 'When will flights to Dublin begin?', o: ['January 18', 'February 1', 'April 1', 'May 1'], a: 3, keep: true, ex: '里斯本、雅典 4/1 開航，都柏林「晚一個月」= 5/1。2/1 是開始售票的日期。' },
        { q: 'What is indicated about Nordvik Airlines?', o: ['It carried more passengers last year than the year before.', 'It is the largest airline in the region.', 'It was founded eighteen years ago.', 'It will purchase four new aircraft.'], ex: '去年載客 420 萬人次，比前年成長 18%。公司成立 6 年；飛機是租（lease）不是買。' },
        { q: 'In which of the positions marked [1], [2], [3], and [4] does the following sentence best belong?\n"Most of them will be based in Oslo."', o: ['[1]', '[2]', '[3]', '[4]'], a: 3, keep: true, ex: 'them 指的是前一句的 120 new staff，所以放在 [4]。' },
      ],
    },
    {
      docs: [
        {
          label: 'Online chat discussion',
          text: `Helen Ford (2:03 P.M.)
Has anyone heard from the printer about the brochures for Thursday's trade show?

Raj Mehta (2:05 P.M.)
I called this morning. They said the brochures will be ready tomorrow afternoon.

Helen Ford (2:06 P.M.)
That's cutting it close. Who can pick them up?

Sofia Lind (2:07 P.M.)
I can. I'll be driving past the print shop on my way back from the Denton office.

Helen Ford (2:08 P.M.)
Great. Raj, did you confirm the booth size with the organizers?

Raj Mehta (2:10 P.M.)
Yes, it's three meters by three. The banner we used last year will fit.

Sofia Lind (2:11 P.M.)
Do we still have that banner? I thought it was damaged.

Raj Mehta (2:13 P.M.)
Good point. I'll check the storage room and let you know.

Helen Ford (2:14 P.M.)
Thanks. If it's not usable, we'll need to order a new one today.`,
        },
      ],
      qs: [
        { q: 'What are the writers preparing for?', o: ['A trade show', 'A store opening', 'A staff party', 'A client visit'], ex: '第一句就提到 Thursday\'s trade show 要用的手冊。' },
        { q: 'At 2:06 P.M., what does Ms. Ford most likely mean when she writes, "That\'s cutting it close"?', o: ['There will be little time to spare.', 'The brochures are too expensive.', 'The print shop is nearby.', 'The order should be reduced.'], ex: 'cut it close = 時間抓得很緊。手冊明天下午才好，展覽就在週四。' },
        { q: 'What does Ms. Lind offer to do?', o: ['Collect some printed materials', 'Contact the event organizers', 'Design a new banner', 'Drive to the trade show'], ex: '她說 I can，會順路經過印刷店去拿手冊。' },
        { q: 'What will Mr. Mehta most likely do next?', o: ['Look for a banner', 'Order new brochures', 'Measure the booth', 'Visit the Denton office'], ex: 'I\'ll check the storage room：去倉庫確認去年的橫幅還在不在、能不能用。' },
      ],
    },
    {
      docs: [
        {
          label: 'Letter',
          text: `Marlow & Finch
80 Canal Road

March 4

Dear Ms. Whitfield,

Thank you for your interest in the Accounting Assistant position at Marlow & Finch. We were impressed by your application and would like to invite you to an interview at our office on Tuesday, March 12, at 10:30 A.M.

The interview will last about one hour and will include a short spreadsheet test. Please bring a photo ID and copies of your professional certificates. Visitor parking is available behind the building.

If this time is not convenient, please call me at 555-0142 to arrange another.

Sincerely,
Daniel Reyes
Human Resources`,
        },
      ],
      qs: [
        { q: 'Why was the letter written?', o: ['To invite a candidate to an interview', 'To offer Ms. Whitfield a job', 'To request a letter of reference', 'To announce a new office address'], ex: 'would like to invite you to an interview：邀請面試，還沒錄取。' },
        { q: 'What is Ms. Whitfield asked to bring?', o: ['Identification', 'A laptop computer', 'Letters of reference', 'A parking permit'], ex: 'Please bring a photo ID and copies of your professional certificates。' },
        { q: 'What is suggested about the interview?', o: ['It will involve a practical task.', 'It will be conducted by telephone.', 'It will take the whole morning.', 'It cannot be rescheduled.'], ex: '面試包含 a short spreadsheet test（試算表實作測驗）。時間約一小時，而且可以打電話改時間。' },
      ],
    },
    {
      docs: [
        {
          label: 'Instructions',
          text: `Kestrel K-200 Electric Kettle — Care Instructions

Thank you for purchasing a Kestrel kettle. To keep it working well, please follow these guidelines.

• Before first use, fill the kettle with water, boil it, and pour the water away. Repeat once.
• Remove mineral deposits once a month by boiling a mixture of water and white vinegar, then rinsing thoroughly.
• Never immerse the base in water. Wipe it with a damp cloth only.
• Do not fill above the MAX line, as boiling water may spill out.

The K-200 comes with a two-year warranty. To register your product, visit www.kestrelhome.example within 30 days of purchase.`,
        },
      ],
      qs: [
        { q: 'What should users do before using the kettle for the first time?', o: ['Boil water in it twice and throw the water away', 'Clean it with vinegar', 'Wipe the inside with a damp cloth', 'Fill it above the MAX line'], ex: '第一點：裝水煮沸後倒掉，再重複一次（Repeat once），共兩次。醋是每月除水垢用的。' },
        { q: 'What is mentioned about the base of the kettle?', o: ['It should not be placed in water.', 'It must be replaced every two years.', 'It should be cleaned with vinegar.', 'It is sold separately.'], ex: 'Never immerse the base in water：底座不可浸水，只能用濕布擦。' },
        { q: 'According to the instructions, what can customers do on the Web site?', o: ['Register their product', 'Order replacement parts', 'Watch a demonstration', 'Extend the warranty'], ex: 'To register your product, visit www.kestrelhome.example。' },
      ],
    },
    {
      docs: [
        {
          label: 'Job advertisement',
          text: `Front Desk Supervisor — Lakeview Hotel, Queenstown

The Lakeview Hotel is seeking an experienced Front Desk Supervisor to lead a team of eight. Responsibilities include preparing staff schedules, handling guest complaints, and training new receptionists.

Requirements:
• At least three years of hotel front-desk experience
• Excellent communication skills
• Willingness to work some weekends and holidays
• Knowledge of a second language is an advantage

We offer a competitive salary, free meals during shifts, and discounted stays at our partner hotels. Send your résumé and a cover letter to careers@lakeviewhotel.example by September 30. Interviews will be held in the second week of October.`,
        },
        {
          label: 'E-mail',
          text: `To: careers@lakeviewhotel.example
From: Owen Hart
Date: September 22
Subject: Front Desk Supervisor

Dear Hiring Manager,

I am writing to apply for the Front Desk Supervisor position advertised on your Web site. I have worked at the reception desk of the Grand Meridian Hotel for five years, the last two as a shift leader. In that role, I create weekly schedules and train new staff. I also speak Spanish fluently, which has been useful with international guests.

I should mention that I will be abroad at a conference from October 8 to 12, but I would be happy to take part in a video interview during that time, or to meet in person the following week.

My résumé is attached. Thank you for your consideration.

Owen Hart`,
        },
      ],
      qs: [
        { q: 'What is NOT mentioned as a duty of the Front Desk Supervisor?', o: ['Managing the hotel\'s budget', 'Making work schedules', 'Dealing with complaints', 'Training employees'], ex: '職責列了排班、處理客訴、訓練新櫃台人員，沒有提到管理預算。' },
        { q: 'What benefit is mentioned in the advertisement?', o: ['Reduced rates at other hotels', 'Free accommodation for staff', 'Extra pay for holiday work', 'Paid language courses'], ex: 'discounted stays at our partner hotels = 合作飯店住宿優惠。' },
        { q: 'In the e-mail, the word "role" in paragraph 1, line 3, is closest in meaning to', o: ['position', 'character', 'performance', 'rule'], ex: '這裡的 role 指他擔任 shift leader 這個「職位」。' },
        { q: 'Which of Mr. Hart\'s qualifications is described in the advertisement as an advantage rather than a requirement?', o: ['His ability to speak Spanish', 'His five years at a hotel reception desk', 'His experience creating schedules', 'His willingness to work weekends'], ex: '廣告寫 Knowledge of a second language is an advantage；Hart 在信中說他西班牙文流利。' },
        { q: 'Why might Mr. Hart be unable to attend an interview in person at the planned time?', o: ['He will be traveling overseas.', 'He works on weekends.', 'He lives far from Queenstown.', 'He has another interview.'], ex: '面試在十月第二週，而他 10/8–12 在國外參加研討會。' },
      ],
    },
    {
      docs: [
        {
          label: 'Schedule',
          text: `Summit Business Workshops — Spring Schedule
All sessions are held at Summit Center, 9:00 A.M.–12:00 P.M.

March 5 — Effective Presentations — Instructor: Laura Pang — $90
March 12 — Time Management — Instructor: Victor Ruiz — $75
March 19 — Negotiation Basics — Instructor: Laura Pang — $90
March 26 — Writing Clear E-mails — Instructor: Amy Sato — $60

Register at least one week before the workshop date. Groups of five or more from the same company receive a 20 percent discount. Fees include materials and light refreshments.`,
        },
        {
          label: 'E-mail',
          text: `To: registration@summitworkshops.example
From: Gary Olsen
Date: March 3
Subject: Registration change

Hello,

Last month I registered six members of my sales team for the March 19 workshop. Unfortunately, we now have a client visit that morning. Would it be possible to move our group to the workshop on March 26 instead? I understand the fee is lower, so please let me know how the difference will be handled.

Also, one of my team members is a vegetarian. Could you confirm that suitable refreshments will be available?

Thank you,
Gary Olsen
Sales Manager, Belmont Tools`,
        },
      ],
      qs: [
        { q: 'What is indicated about the Summit workshops?', o: ['They take place in the morning.', 'They are held online.', 'They all cost the same.', 'They last a full day.'], ex: '所有課程都是 9:00 A.M.–12:00 P.M.，也就是上午。' },
        { q: 'Who is scheduled to teach the workshop that Mr. Olsen originally registered for?', o: ['Laura Pang', 'Victor Ruiz', 'Amy Sato', 'Gary Olsen'], ex: '他原本報 3/19 的 Negotiation Basics，講師是 Laura Pang（需對照兩篇）。' },
        { q: "What is suggested about Mr. Olsen's group?", o: ['It qualified for a discount.', 'It registered too late.', 'It includes ten people.', 'It has attended a Summit workshop before.'], ex: '他報了六個人，而同公司五人以上有八折。' },
        { q: 'Which workshop does Mr. Olsen want his team to attend?', o: ['Writing Clear E-mails', 'Effective Presentations', 'Time Management', 'Negotiation Basics'], ex: '他想改到 3/26，對照課表是 Writing Clear E-mails。' },
        { q: 'What does Mr. Olsen ask about?', o: ['Food options', 'Parking spaces', 'Course materials', 'The location of the center'], ex: '有一位組員吃素，他想確認茶點是否有適合的選擇。' },
      ],
    },
    {
      docs: [
        {
          label: 'Web page',
          text: `Oakline Furniture — Home Office Collection

Arden Desk (120 cm) — $240 — Solid oak top, two drawers
Birch Bookcase (5 shelves) — $150
Corvo Office Chair — $180 — Adjustable height, available in black or gray
Delta Filing Cabinet (3 drawers) — $95

Free delivery on orders over $300. Assembly service is available for $40 per order. All items carry a one-year warranty. Returns are accepted within 14 days of delivery.`,
        },
        {
          label: 'Order confirmation',
          text: `Oakline Furniture — Order #58213
Date: May 3
Customer: Nina Petrova

1 × Arden Desk — $240
1 × Corvo Office Chair (gray) — $180
Assembly service — $40
Delivery — $0
Total — $460

Estimated delivery: May 10`,
        },
        {
          label: 'E-mail',
          text: `To: support@oakline.example
From: Nina Petrova
Date: May 11
Subject: Order #58213

Hello,

My order arrived yesterday, and your technicians assembled everything quickly. However, the chair I received is black, not the color I ordered. In addition, one of the desk drawers does not close properly.

I would like the chair replaced with the correct one. As for the desk, I would prefer to have the drawer repaired rather than return the whole item. Please let me know when someone can come. I work from home, so any weekday is fine.

Regards,
Nina Petrova`,
        },
      ],
      qs: [
        { q: 'According to the Web page, what is true of all the items?', o: ['They come with a one-year warranty.', 'They are made of solid oak.', 'They are available in two colors.', 'They are delivered fully assembled.'], ex: 'All items carry a one-year warranty。實木與顏色只是個別商品的說明，組裝要另外付費。' },
        { q: 'Why was Ms. Petrova not charged for delivery?', o: ['Her order was worth more than $300.', 'She paid for the assembly service.', 'She is a returning customer.', 'She collected the items herself.'], ex: '網頁寫滿 $300 免運，她的訂單金額是 $460。' },
        { q: "What is suggested about Ms. Petrova's order?", o: ['It arrived on the expected date.', 'It was delivered a week late.', 'It was missing a bookcase.', 'It was sent to her office.'], ex: '信件日期 5/11，說 arrived yesterday = 5/10，正是預計送達日。' },
        { q: 'What color chair did Ms. Petrova order?', o: ['Gray', 'Black', 'White', 'Brown'], ex: '訂單上寫 Corvo Office Chair (gray)；她收到的是黑色。' },
        { q: 'What does Ms. Petrova ask the company to do about the desk?', o: ['Fix one of its parts', 'Exchange it for a larger model', 'Refund its full price', 'Take it back to the store'], ex: '她希望修理抽屜（have the drawer repaired），而不是整張退回。' },
      ],
    },
    {
      docs: [
        {
          label: 'Announcement',
          text: `Bayfield Small Business Expo
Saturday, November 9 — Bayfield Convention Hall

Meet more than 80 local companies, attend free seminars, and get advice from experienced entrepreneurs.

Admission is $10 at the door or $7 if purchased online before November 1. Members of the Bayfield Chamber of Commerce enter free. Parking is available at the hall for $5.`,
        },
        {
          label: 'Schedule',
          text: `Bayfield Small Business Expo — Seminar Schedule

10:00 A.M. — Starting an Online Store — Room 1 — Kevin Drake
11:30 A.M. — Low-Cost Marketing Ideas — Room 2 — Elena Rossi
1:30 P.M. — Understanding Small Business Loans — Room 1 — Samuel Obi
3:00 P.M. — Hiring Your First Employee — Room 2 — Nadia Haddad

Seating is limited to 50 people per seminar. Doors close once the room is full.`,
        },
        {
          label: 'E-mail',
          text: `To: info@bayfieldexpo.example
From: Carla Jensen
Date: November 11
Subject: Feedback

Dear organizers,

I attended the expo on Saturday and found it very useful. As a Chamber member, I appreciated the free entry. Mr. Obi's seminar in particular answered many of my questions, since I'm planning to apply for financing to open a second flower shop next year.

I do have one suggestion. I arrived ten minutes early for the 3:00 seminar but could not get in because the room was already full. Perhaps popular sessions could be held in a larger room or repeated.

Best regards,
Carla Jensen`,
        },
      ],
      qs: [
        { q: 'How can attendees get a discount on admission?', o: ['By buying tickets online in advance', 'By arriving before 10:00 A.M.', 'By attending a seminar', 'By parking at the hall'], ex: '現場 $10，11/1 前上網買只要 $7。' },
        { q: 'How much did Ms. Jensen most likely pay for admission?', o: ['Nothing', '$5', '$7', '$10'], a: 0, keep: true, ex: '她是 Chamber member，公告寫商會會員免費入場（需對照兩篇）。$5 是停車費。' },
        { q: 'Which seminar did Ms. Jensen find especially helpful?', o: ['Understanding Small Business Loans', 'Starting an Online Store', 'Low-Cost Marketing Ideas', 'Hiring Your First Employee'], ex: '她說 Mr. Obi 的講座最有幫助，對照時程表是小型企業貸款那一場。' },
        { q: 'What is indicated about Ms. Jensen?', o: ['She owns a flower shop.', 'She works for a bank.', 'She led one of the seminars.', 'She helped organize the expo.'], ex: '她打算開「第二家」花店，表示已經有一家。' },
        { q: 'Who led the seminar that Ms. Jensen was unable to attend?', o: ['Nadia Haddad', 'Kevin Drake', 'Elena Rossi', 'Samuel Obi'], ex: '她進不去的是 3:00 的講座，對照時程表講者是 Nadia Haddad。' },
      ],
    },
    {
      docs: [
        {
          label: 'E-mail',
          text: `To: Andrew Walsh
From: Mei Tanaka, Corporate Travel
Date: June 3
Subject: Your trip to Singapore

Dear Andrew,

Your travel arrangements for the Asia-Pacific Sales Conference are attached. I've booked you at the Harbor Crown Hotel, which is a five-minute walk from the conference venue. Breakfast is included.

Please keep all receipts for meals and taxis, and submit them with your expense report within ten days of your return. Let me know by Friday if anything needs to be changed.

Mei`,
        },
        {
          label: 'Itinerary',
          text: `Traveler: Andrew Walsh

June 16 — Flight SA 301: depart Sydney 8:15 A.M., arrive Singapore 2:35 P.M.
June 16–20 — Harbor Crown Hotel (4 nights), confirmation no. HC-77421
June 17–19 — Asia-Pacific Sales Conference, Marina Exhibition Centre
June 20 — Flight SA 306: depart Singapore 9:40 A.M., arrive Sydney 7:20 P.M.`,
        },
        {
          label: 'E-mail',
          text: `To: Mei Tanaka
From: Andrew Walsh
Date: June 4
Subject: RE: Your trip to Singapore

Hi Mei,

Thanks for arranging everything. There is one change I'd like to request. A client in Singapore, Mr. Lim, has invited me to visit his factory on the morning after the conference ends. Could you move my return flight to the evening of the same day, or to the next morning if nothing is available? I'd also need to check out later than usual, so please ask the hotel whether that's possible.

Everything else looks fine.

Andrew`,
        },
      ],
      qs: [
        { q: 'What is Mr. Walsh asked to do after his trip?', o: ['Hand in his receipts', 'Write a report on the conference', 'Pay the hotel bill', 'Call Ms. Tanaka on Friday'], ex: '保留收據，回來十天內連同費用報告一起交。' },
        { q: 'What is indicated about the Harbor Crown Hotel?', o: ['It is near the Marina Exhibition Centre.', 'It is next to the airport.', 'It does not serve breakfast.', 'It is where the conference will be held.'], ex: '飯店離會場步行五分鐘，而行程表顯示會場是 Marina Exhibition Centre（需對照兩篇）。' },
        { q: 'How long will the conference last?', o: ['Two days', 'Three days', 'Four days', 'Five days'], a: 1, keep: true, ex: '6/17–19 共三天；四晚是住宿天數。' },
        { q: 'When does Mr. Walsh want to visit the factory?', o: ['June 17', 'June 19', 'June 20', 'June 21'], a: 2, keep: true, ex: '會議 6/19 結束，「結束後隔天早上」就是 6/20。' },
        { q: 'What does Mr. Walsh ask Ms. Tanaka to find out?', o: ['Whether he can leave the hotel later than usual', 'Whether Mr. Lim can attend the conference', 'Whether breakfast is included', 'Whether the factory is near the hotel'], ex: '他需要晚一點退房，請她問飯店是否可行。' },
      ],
    },
  ],
}
