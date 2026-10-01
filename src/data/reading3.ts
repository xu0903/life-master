import type { RawTest } from './reading'

// 原創模擬題，題型與題數比照多益閱讀測驗（Part 5–7，共 100 題）。選項第一個是正確答案，載入時會打散。
export const TEST_3: RawTest = {
  id: 'r3',
  name: '模擬試題 3',
  part5: [
    { q: 'Please return the signed form to ------- by Friday.', o: ['me', 'my', 'mine', 'myself'], tag: 'pron', ex: '介系詞 to 後面接受格 me。' },
    { q: 'The new branch office will open ------- in March.', o: ['officially', 'official', 'officiate', 'officials'], tag: 'pos', ex: '修飾動詞 open 用副詞 officially（正式地）。' },
    { q: 'The training session has been rescheduled ------- next Tuesday.', o: ['for', 'at', 'during', 'among'], tag: 'prep', ex: 'reschedule A for + 時間 = 把 A 改到某時。' },
    { q: 'Mr. Kwan was unable to attend the meeting ------- he was traveling overseas.', o: ['because', 'despite', 'so', 'unless'], tag: 'conj', ex: '後面是原因子句，用 because。despite 後接名詞，so 表結果。' },
    { q: 'Our customer service team is committed to ------- every inquiry within 24 hours.', o: ['answering', 'answer', 'answered', 'answers'], tag: 'verb', ex: 'be committed to 的 to 是介系詞，後接動名詞。' },
    { q: 'The marketing budget for next year has not been ------- yet.', o: ['finalized', 'finalize', 'finalizing', 'finality'], tag: 'verb', ex: '預算是「被敲定」，現在完成被動 has been + 過去分詞。' },
    { q: 'Visitors must wear safety helmets at all times ------- in the construction area.', o: ['while', 'during', 'between', 'upon'], tag: 'conj', ex: 'while (they are) in the area，連接詞後省略主詞與 be 動詞；during 後面要接名詞。' },
    { q: "This year's sales conference attracted a ------- number of participants.", o: ['record', 'recording', 'recorded', 'records'], tag: 'vocab', ex: 'a record number of = 創紀錄的數量，record 當形容詞用。' },
    { q: 'The director asked Ms. Ortiz to ------- the new employees to the team.', o: ['introduce', 'inform', 'notify', 'announce'], tag: 'vocab', ex: 'introduce A to B = 把 A 介紹給 B。inform / notify 的受詞是被告知的人。' },
    { q: 'The new coffee machine is ------- to use than the old one.', o: ['easier', 'easy', 'easiest', 'easily'], tag: 'pos', ex: '後面有 than，用比較級 easier。' },
    { q: 'Each of the participants ------- a certificate at the end of the course.', o: ['receives', 'receive', 'receiving', 'have received'], tag: 'verb', ex: 'Each of + 複數名詞，主詞是 Each，動詞用單數 receives。' },
    { q: 'The report was ------- accurate, but a few figures needed to be updated.', o: ['largely', 'large', 'largest', 'enlarge'], tag: 'pos', ex: '修飾形容詞 accurate 用副詞 largely（大致上）。' },
    { q: "The hotel's renovation was completed ------- schedule.", o: ['ahead of', 'in front of', 'instead of', 'because of'], tag: 'prep', ex: 'ahead of schedule = 比預定提早。in front of 指空間上的前面。' },
    { q: 'Applications ------- after the deadline will not be considered.', o: ['received', 'receiving', 'receive', 'to receive'], tag: 'verb', ex: '申請是「被收到」，用過去分詞後位修飾：Applications (that are) received。' },
    { q: 'The museum offers free admission to students ------- a valid ID.', o: ['with', 'among', 'along', 'across'], tag: 'prep', ex: 'students with a valid ID = 持有效證件的學生。' },
    { q: 'Mr. Lopez has ------- agreed to give a speech at the awards dinner.', o: ['kindly', 'kind', 'kindness', 'kinder'], tag: 'pos', ex: '修飾動詞 agreed 用副詞 kindly（好心地）。' },
    { q: "The factory's output has increased ------- since new equipment was installed.", o: ['steadily', 'steady', 'steadiness', 'steadied'], tag: 'pos', ex: '修飾動詞 increased 用副詞 steadily（穩定地）。' },
    { q: 'Please ------- that all lights are turned off before leaving the office.', o: ['ensure', 'prevent', 'remind', 'allow'], tag: 'vocab', ex: 'ensure that… = 確保…。remind 後面要先接人。' },
    { q: '------- the new policy, employees may work from home two days a week.', o: ['Under', 'Below', 'Beneath', 'Over'], tag: 'prep', ex: 'under the policy = 依照這項政策。below / beneath 指位置在下方。' },
    { q: 'The company is looking for a candidate ------- can speak both English and Japanese.', o: ['who', 'whom', 'whose', 'which'], tag: 'pron', ex: '先行詞是人，在子句中當主詞，用 who。' },
    { q: 'If the weather ------- good tomorrow, the picnic will be held in the park.', o: ['is', 'will be', 'was', 'being'], tag: 'verb', ex: '條件句 if 子句用現在式代替未來式。' },
    { q: 'The CEO thanked the staff for their hard work and -------.', o: ['dedication', 'dedicate', 'dedicated', 'dedicating'], tag: 'pos', ex: 'and 連接兩個名詞：hard work and dedication（投入）。' },
    { q: '------- you have finished the survey, please hand it to the receptionist.', o: ['Once', 'Even', 'Despite', 'Whether'], tag: 'conj', ex: 'Once + 子句 = 一旦…之後。' },
    { q: 'The shipping costs are ------- in the price shown on the Web site.', o: ['included', 'including', 'include', 'inclusion'], tag: 'verb', ex: '運費「被包含」在價格裡：are included。' },
    { q: "We were impressed by the ------- of the applicants' presentations.", o: ['quality', 'qualify', 'qualified', 'qualifying'], tag: 'pos', ex: 'the ___ of 中間需要名詞 quality（品質）。' },
    { q: 'Please read the instructions ------- before assembling the furniture.', o: ['carefully', 'careful', 'care', 'cared'], tag: 'pos', ex: '修飾動詞 read 用副詞 carefully。' },
    { q: 'Ms. Bauer has been with the company ------- 2015.', o: ['since', 'for', 'during', 'until'], tag: 'prep', ex: '現在完成式 + since + 時間點。for 後面接一段時間。' },
    { q: 'The new software allows users to ------- their files from any device.', o: ['access', 'excess', 'assess', 'accent'], tag: 'vocab', ex: 'access files = 存取檔案。assess 是評估。' },
    { q: 'Most of the employees ------- that the new parking policy is fair.', o: ['agree', 'agreement', 'agreeing', 'agreeable'], tag: 'verb', ex: '主詞 Most of the employees 後面缺動詞，用 agree。' },
    { q: 'The conference room is too small to ------- all the department staff.', o: ['accommodate', 'accompany', 'accomplish', 'accumulate'], tag: 'vocab', ex: 'accommodate = 容納。accompany 是陪同，accomplish 是完成。' },
  ],
  part6: [
    {
      docs: [
        {
          label: 'E-mail',
          text: `To: All Employees
From: Facilities Department
Subject: Office relocation

As you know, our team will move to the new building on Harbor Avenue next month. The move will take place over the weekend of June 14 so that business is not {1}.

Before then, please pack the items on your desk into the boxes that will be {2} to each department on June 10. {3} Movers will transport all furniture and computers.

Label each box clearly with your name and new desk number, which will be sent to you {4} e-mail next week.`,
        },
      ],
      qs: [
        { q: '', o: ['interrupted', 'interrupting', 'interrupt', 'interruption'], ex: '業務「被中斷」，be + 過去分詞：is not interrupted。' },
        { q: '', o: ['delivered', 'deliver', 'delivering', 'delivery'], ex: '箱子「被送到」各部門：will be delivered。' },
        {
          q: '',
          o: [
            'Personal items such as plants and photos should be taken home in advance.',
            'The new building has a large cafeteria.',
            'Harbor Avenue is closed for repairs.',
            'Our department has grown rapidly this year.',
          ],
          ex: '前後都在說打包與搬運，補充「私人物品請先帶回家」最連貫。',
        },
        { q: '', o: ['by', 'with', 'on', 'at'], ex: 'by e-mail = 用電子郵件寄送。' },
      ],
    },
    {
      docs: [
        {
          label: 'Advertisement',
          text: `Stay at the Seaview Inn and enjoy the best of coastal living. All of our rooms {1} private balconies overlooking the ocean. Guests can also enjoy our heated pool and award-winning restaurant.

{2} you are traveling for business or pleasure, our friendly staff will make sure your stay is comfortable. {3}

For a limited time, guests who book three nights or more will receive a {4} breakfast each morning.`,
        },
      ],
      qs: [
        { q: '', o: ['feature', 'features', 'featuring', 'to feature'], ex: '主詞 All of our rooms 是複數，動詞用 feature（設有）。' },
        { q: '', o: ['Whether', 'Either', 'Both', 'Unless'], ex: 'Whether A or B = 不論是 A 還是 B。' },
        {
          q: '',
          o: [
            'Free parking is also available for all guests.',
            'The ocean is quite cold in winter.',
            'Our staff was hired last year.',
            'Many hotels raise their prices in summer.',
          ],
          ex: '廣告在列舉飯店的好處，also 再補充一項（免費停車）最自然。',
        },
        { q: '', o: ['complimentary', 'compliment', 'complimented', 'complimenting'], ex: '修飾名詞 breakfast 用形容詞 complimentary（免費招待的）。' },
      ],
    },
    {
      docs: [
        {
          label: 'Letter',
          text: `Dear Ms. Grant,

Thank you for your letter regarding the delay in your order. We sincerely apologize for the {1}. Our warehouse experienced a computer system failure last week, which caused several shipments to be postponed.

The problem has now been {2}, and your order was shipped this morning. {3}

To make up for the delay, we have {4} a gift card worth $20 with this letter.

Sincerely,
Customer Relations, Homeway Supplies`,
        },
      ],
      qs: [
        { q: '', o: ['trouble', 'troubled', 'troubling', 'troublesome'], ex: 'the 後面接名詞；apologize for the trouble = 造成麻煩很抱歉。' },
        { q: '', o: ['resolved', 'resolve', 'resolving', 'resolution'], ex: '問題「已被解決」：has been resolved。' },
        {
          q: '',
          o: [
            'It should arrive within two business days.',
            'Our warehouse is the largest in the region.',
            'Please pay the remaining balance.',
            'We hope to hire new staff soon.',
          ],
          ex: '前一句說今早已出貨，接著說明預計幾天內送達最合理。',
        },
        { q: '', o: ['enclosed', 'enclosing', 'enclose', 'enclosure'], ex: '現在完成式 have + 過去分詞：we have enclosed = 隨信附上。' },
      ],
    },
    {
      docs: [
        {
          label: 'Article',
          text: `GREENVILLE (May 2) — The city council has approved a plan to launch a bike-sharing program this autumn. Two hundred bicycles will be placed at thirty stations {1} the downtown area. Residents will be able to rent a bike using a mobile app for $2 per hour. {2}

Council member Dana Ruiz said the program is part of the city's effort to {3} traffic congestion. "We want to make it easier for people to leave their cars at home," she said.

If the program is successful, it may be {4} to other neighborhoods next year.`,
        },
      ],
      qs: [
        { q: '', o: ['throughout', 'during', 'beyond', 'onto'], ex: 'throughout the downtown area = 遍布整個市中心。' },
        {
          q: '',
          o: [
            'Monthly passes will also be offered at a discount.',
            'Bicycles were invented in the nineteenth century.',
            'The council meets every Tuesday.',
            'Traffic lights will be replaced next year.',
          ],
          ex: '前一句講每小時的租金，also 補充月票優惠最連貫。',
        },
        { q: '', o: ['reduce', 'reduction', 'reduced', 'reducing'], ex: 'effort to + 原形動詞；reduce traffic congestion = 減少塞車。' },
        { q: '', o: ['expanded', 'expand', 'expanding', 'expansion'], ex: '計畫「被擴大」到其他區：may be expanded。' },
      ],
    },
  ],
  part7: [
    {
      docs: [
        {
          label: 'Sign',
          text: `Westfield Mall Parking

First hour free with any purchase — have your ticket stamped at the store.
After the first hour: $2 per hour, maximum $12 per day.
Lost tickets will be charged the daily maximum.

The garage closes at midnight. Vehicles left overnight will be towed at the owner's expense.`,
        },
      ],
      qs: [
        { q: 'How can drivers park for free?', o: ['By having their ticket stamped after a purchase', 'By arriving before noon', 'By parking for less than two hours', 'By showing a membership card'], ex: '消費後在店家蓋章，第一小時免費。' },
        { q: 'What happens if a driver loses a parking ticket?', o: ['The driver pays the daily maximum.', 'The car is towed.', 'The driver pays $2.', 'The driver must return the next day.'], ex: 'Lost tickets will be charged the daily maximum（$12）。' },
      ],
    },
    {
      docs: [
        {
          label: 'Text-message chain',
          text: `Kenji Sato (11:20 A.M.)
The client wants to move our lunch meeting to 1:00. Does that work for you?

Amy Fox (11:22 A.M.)
I have a call at 1:30, but I can take it from my phone.

Kenji Sato (11:23 A.M.)
Great. I'll book a table at Bella Cucina instead of the café. It's quieter.

Amy Fox (11:24 A.M.)
Sounds good. Should I bring the catalog?

Kenji Sato (11:25 A.M.)
Yes, please. The new spring line is what they're most interested in.`,
        },
      ],
      qs: [
        { q: "What is the purpose of Mr. Sato's first message?", o: ['To ask about a schedule change', 'To cancel a meeting', 'To recommend a restaurant', 'To request a catalog'], ex: '客戶想把午餐會議改到一點，他問 Amy 可不可以。' },
        { q: 'At 11:22 A.M., what does Ms. Fox imply when she writes, "I can take it from my phone"?', o: ['She can attend the lunch despite another commitment.', 'She will miss the lunch meeting.', 'She has lost her phone.', 'She wants to reschedule her call.'], ex: '1:30 有通電話，但她可以用手機在外面接，所以能去午餐會議。' },
      ],
    },
    {
      docs: [
        {
          label: 'Invitation',
          text: `You're invited!
Celebrate 25 years of Harmon Engineering

Friday, October 18, 6:00–9:00 P.M.
Rooftop Terrace, Harmon Tower

Dinner, live music, and a short slideshow of company history.
Please RSVP to Lisa Tran in Human Resources by October 11. Guests are welcome.`,
        },
      ],
      qs: [
        { q: 'What is being celebrated?', o: ["A company's anniversary", "An employee's retirement", 'A new office opening', 'A product launch'], ex: 'Celebrate 25 years of Harmon Engineering：公司 25 週年。' },
        { q: 'What are recipients asked to do?', o: ['Reply by a certain date', 'Bring a dish', 'Prepare a slideshow', 'Buy a ticket'], ex: 'Please RSVP… by October 11：10/11 前回覆是否出席。' },
      ],
    },
    {
      docs: [
        {
          label: 'Memo',
          text: `MEMO
To: All staff
From: Robert Hale, Office Manager
Date: March 2
Re: Kitchen cleaning

Starting next Monday, we will introduce a rotation system for keeping the staff kitchen clean. Each week, one department will be responsible for wiping the counters, emptying the dishwasher, and throwing away old food from the refrigerator every Friday afternoon. The schedule is posted on the kitchen door. The accounting department will be first.

Please remember that the refrigerator will be emptied every Friday at 4:00 P.M., so label any food you want to keep.`,
        },
      ],
      qs: [
        { q: 'Why was the memo written?', o: ['To introduce a new cleaning arrangement', 'To announce a kitchen renovation', 'To ask for volunteers', 'To report a broken appliance'], ex: '下週一起實施各部門輪流清潔廚房的制度。' },
        { q: 'Which department will clean the kitchen first?', o: ['Accounting', 'Sales', 'Human Resources', 'Facilities'], ex: 'The accounting department will be first。' },
        { q: 'What are employees advised to do?', o: ['Label their food', 'Clean their desks every day', 'Bring their own dishes', 'Sign up for a shift'], ex: '週五四點會清空冰箱，要保留的食物請貼上名字。' },
      ],
    },
    {
      docs: [
        {
          label: 'Review',
          text: `Review: The Solis X2 Portable Speaker

The Solis X2 is small enough to fit in a jacket pocket, yet it produces surprisingly rich sound. Its battery lasts up to 18 hours, nearly twice as long as most speakers in its price range. It is also waterproof, making it a good choice for the beach or pool.

My only complaint is that it comes in just two colors, black and white. At $79, the X2 offers excellent value.`,
        },
      ],
      qs: [
        { q: 'What is mentioned as an advantage of the speaker?', o: ['Its long battery life', 'Its low weight', 'Its large size', 'Its free accessories'], ex: '電池可用 18 小時，是同價位的將近兩倍。' },
        { q: 'What does the reviewer criticize?', o: ['The limited color choices', 'The sound quality', 'The price', 'The size'], ex: 'My only complaint is that it comes in just two colors。' },
        { q: 'What is suggested about the speaker?', o: ['It can be used near water.', 'It is the most expensive model.', 'It must be plugged in to work.', 'It is sold only online.'], ex: '防水，適合海邊或泳池。' },
      ],
    },
    {
      docs: [
        {
          label: 'E-mail',
          text: `To: Jacob Miller
From: Brightline Internet
Date: July 3
Subject: Scheduled maintenance

Dear Mr. Miller,

We will be upgrading the equipment in your area on Tuesday, July 9, between 1:00 A.M. and 5:00 A.M. During this time, your Internet service may be unavailable for up to two hours. You do not need to take any action; your service will be restored automatically.

We have chosen these hours to minimize disruption for our customers. If you have any problems after the upgrade, please restart your modem. If that does not help, contact our support team at 555-0130.

Thank you for choosing Brightline.`,
        },
      ],
      qs: [
        { q: 'Why was the e-mail sent?', o: ['To announce a temporary service interruption', 'To advertise a faster plan', 'To request a payment', 'To confirm a repair visit'], ex: '7/9 凌晨設備升級，網路可能中斷最多兩小時。' },
        { q: 'Why were the hours of the work chosen?', o: ['To affect as few customers as possible', 'To reduce the cost of the work', 'Because technicians are available then', 'Because the equipment is new'], ex: 'to minimize disruption for our customers。' },
        { q: 'What should Mr. Miller do first if he has problems after the upgrade?', o: ['Restart a device', 'Call the support team', 'Buy a new modem', 'Reply to the e-mail'], ex: '先重開數據機，沒用再打客服。' },
      ],
    },
    {
      docs: [
        {
          label: 'Article',
          text: `Riverside Café Celebrates 10 Years

PORTLAND (August 5) — Riverside Café, a popular spot for breakfast near the waterfront, marked its tenth anniversary last weekend. —[1]— Owner Teresa Lin opened the café in 2016 with just six tables. Today it seats sixty and employs twenty-two people.

Ms. Lin credits the café's success to its locally sourced ingredients. —[2]— "We buy our eggs, milk, and vegetables from farms within fifty kilometers," she explained.

To celebrate the anniversary, the café is offering a free pastry with every coffee purchased this month. —[3]— Ms. Lin also plans to extend opening hours to include dinner service starting in October. —[4]—`,
        },
      ],
      qs: [
        { q: 'What is the article mainly about?', o: ["A business's anniversary", 'A new restaurant opening', 'A local farm', 'A cooking competition'], ex: 'Riverside Café 慶祝開業十週年。' },
        { q: 'What is indicated about Riverside Café?', o: ['It has grown since it opened.', 'It serves only dinner.', 'It has moved to a new location.', 'It was opened twenty years ago.'], ex: '從六張桌子成長到可坐六十人、員工二十二人。' },
        { q: 'According to Ms. Lin, what has contributed to the café\'s success?', o: ['Its use of local products', 'Its low prices', 'Its long opening hours', 'Its waterfront view'], ex: '她把成功歸功於在地食材。' },
        { q: 'In which of the positions marked [1], [2], [3], and [4] does the following sentence best belong?\n"She is currently looking for an experienced chef to help with the new menu."', o: ['[1]', '[2]', '[3]', '[4]'], a: 3, keep: true, ex: '新菜單對應前一句十月起供應晚餐，所以放 [4]。' },
      ],
    },
    {
      docs: [
        {
          label: 'Online chat discussion',
          text: `Grace Kim (9:01 A.M.)
Morning, team. The projector in Conference Room A stopped working during yesterday's client presentation.

Leo Park (9:03 A.M.)
I noticed that too. I think the bulb burned out.

Grace Kim (9:04 A.M.)
Can we get it replaced before Thursday? We have the investor meeting then.

Nina Shah (9:06 A.M.)
I'll check with the supplier. Last time it took a week to get a new bulb.

Leo Park (9:07 A.M.)
If it doesn't arrive in time, we could use Conference Room C. Its projector is newer.

Grace Kim (9:08 A.M.)
That room is too small for twelve people.

Nina Shah (9:12 A.M.)
Good news. The supplier has the bulb in stock and can deliver it tomorrow.

Grace Kim (9:13 A.M.)
Perfect. Leo, can you install it when it arrives?

Leo Park (9:14 A.M.)
Will do.`,
        },
      ],
      qs: [
        { q: 'What problem is being discussed?', o: ['A piece of equipment is not working.', 'A client canceled a meeting.', 'A room was double-booked.', 'A supplier raised its prices.'], ex: 'A 會議室的投影機壞了（燈泡燒掉）。' },
        { q: 'What will take place on Thursday?', o: ['A meeting with investors', 'A client presentation', 'A product delivery', 'A staff training'], ex: 'We have the investor meeting then。' },
        { q: 'At 9:08 A.M., why does Ms. Kim write, "That room is too small for twelve people"?', o: ['To reject a suggestion', 'To request a larger budget', 'To complain about a booking', 'To explain a delay'], ex: 'Leo 提議改用 C 會議室，她說太小，等於否決這個提議。' },
        { q: 'What will Mr. Park most likely do tomorrow?', o: ['Replace a bulb', 'Contact the supplier', 'Book Conference Room C', 'Meet the investors'], ex: '燈泡明天送到，Grace 請他安裝，他回 Will do。' },
      ],
    },
    {
      docs: [
        {
          label: 'Job advertisement',
          text: `Part-Time Delivery Driver — Fresh Basket Grocery

Fresh Basket is hiring part-time drivers to deliver online orders to customers' homes. Shifts are available in the mornings (8 A.M.–12 P.M.) and evenings (4 P.M.–8 P.M.), including weekends.

Applicants must have a valid driver's license and a clean driving record. Experience in customer service is a plus. Company vehicles are provided, and drivers receive a 15 percent discount on groceries.

To apply, visit any Fresh Basket store and ask for an application form, or apply online at freshbasket.example/jobs.`,
        },
      ],
      qs: [
        { q: 'What is a requirement for the position?', o: ["A valid driver's license", 'Experience in customer service', 'Owning a vehicle', 'Availability on weekdays only'], ex: '必備條件是有效駕照與良好駕駛紀錄；客服經驗只是加分。公司會提供車輛。' },
        { q: 'What is offered to drivers?', o: ['A discount on store products', 'A monthly bonus', 'Free meals', 'Paid training'], ex: 'drivers receive a 15 percent discount on groceries。' },
        { q: 'What is NOT mentioned as a way to apply?', o: ['Sending an e-mail', 'Visiting a store', 'Going to a Web site', 'Filling out a form'], ex: '可以到門市索取申請表或上網申請，沒提到寄 e-mail。' },
      ],
    },
    {
      docs: [
        {
          label: 'Schedule',
          text: `Oakdale Community Center — Fall Classes

Beginner Photography — Mondays, 7–9 P.M., starts Sept. 9 — $80
Healthy Cooking — Wednesdays, 6–8 P.M., starts Sept. 11 — $95 (ingredients included)
Conversational Spanish — Thursdays, 7–8:30 P.M., starts Sept. 12 — $70

Registration opens August 15. Oakdale residents receive a 10 percent discount. Classes with fewer than six registered students by September 1 may be canceled.`,
        },
      ],
      qs: [
        { q: 'Which class includes materials in its fee?', o: ['Healthy Cooking', 'Beginner Photography', 'Conversational Spanish', 'All of the classes'], ex: 'Healthy Cooking 標示 ingredients included（含食材）。' },
        { q: 'Who can receive a discount?', o: ['Local residents', 'Students', 'People who register early', 'People who take two classes'], ex: 'Oakdale residents receive a 10 percent discount。' },
        { q: 'What might happen to some classes?', o: ['They may be canceled.', 'They may be moved online.', 'Their fees may increase.', 'They may start earlier.'], ex: '9/1 前報名不足六人的課可能取消。' },
      ],
    },
    {
      docs: [
        {
          label: 'Web page',
          text: `Call for Speakers — Northwest Small Business Forum
Seattle, April 22–23

We invite experienced business owners and consultants to lead 45-minute sessions on topics such as marketing, finance, hiring, and technology. Speakers receive free admission to both days of the forum and a $200 travel allowance.

Proposals should include a session title, a short description (no more than 200 words), and a brief biography. Submit proposals to speakers@nwbizforum.example by February 15. Selected speakers will be notified by March 1.`,
        },
        {
          label: 'E-mail',
          text: `To: speakers@nwbizforum.example
From: Olivia Grant
Date: February 10
Subject: Session proposal

Hello,

I would like to propose a session titled "Hiring Your First Five Employees." I own a staffing agency in Portland and have helped more than 300 small businesses find staff over the past eight years. My session description and biography are attached.

Please note that I am only available on the first day of the forum, as I will be traveling to a client meeting on the 23rd.

Thank you for considering my proposal.

Olivia Grant`,
        },
      ],
      qs: [
        { q: 'What is the purpose of the Web page?', o: ['To invite people to submit proposals', 'To sell tickets to a forum', 'To announce the selected speakers', 'To advertise a consulting service'], ex: 'Call for Speakers：徵求講者投稿。' },
        { q: 'What is NOT offered to speakers?', o: ['A speaking fee', 'Free admission', 'A travel allowance', 'A 45-minute session'], ex: '講者可免費入場並有 $200 交通補助，沒有講師費。' },
        { q: "What is the topic of Ms. Grant's session?", o: ['Hiring', 'Marketing', 'Finance', 'Technology'], ex: '講題是 Hiring Your First Five Employees。' },
        { q: 'When is Ms. Grant available to speak?', o: ['April 22', 'April 23', 'February 15', 'March 1'], a: 0, keep: true, ex: '她只有論壇第一天有空，網頁寫論壇是 4/22–23，所以是 4/22（需對照兩篇）。' },
        { q: "What is suggested about Ms. Grant's proposal?", o: ['It was sent before the deadline.', 'It is longer than 200 words.', 'It has already been accepted.', 'It is missing a biography.'], ex: '截止日 2/15，她 2/10 寄出。' },
      ],
    },
    {
      docs: [
        {
          label: 'Warranty information',
          text: `Breezo Air Purifier — Model AP-300 Warranty

The AP-300 is covered by a two-year warranty against defects in materials and workmanship. The warranty does not cover filters, which should be replaced every six months.

To make a claim, contact customer support with your proof of purchase and the serial number located on the bottom of the unit. Repairs under warranty are free of charge; shipping costs will be refunded once the claim is approved.`,
        },
        {
          label: 'E-mail',
          text: `To: support@breezo.example
From: Daniel Ng
Date: November 4
Subject: AP-300 problem

Hello,

I bought an AP-300 from Homeway Electronics fourteen months ago. For the past week, the fan has been making a loud rattling noise, even on the lowest setting. I have already replaced the filter, but the noise continues.

I have attached a photo of my receipt. However, I could not find the serial number in the place described in the manual — the label seems to have worn off. Please let me know how to proceed.

Daniel Ng`,
        },
      ],
      qs: [
        { q: 'According to the warranty information, what is NOT covered?', o: ['Filters', 'Repairs', 'Shipping costs', 'Defects in materials'], ex: 'The warranty does not cover filters。' },
        { q: 'Why did Mr. Ng write the e-mail?', o: ['To report a problem with a product', 'To order a new filter', 'To ask for a refund', 'To complain about a store'], ex: '風扇發出很大的嘎嘎聲。' },
        { q: "What is suggested about Mr. Ng's air purifier?", o: ['It is still under warranty.', 'It was bought online.', 'It is a new model.', 'It has never been used.'], ex: '買了 14 個月，保固兩年，所以還在保固內（需對照兩篇）。' },
        { q: 'What does Mr. Ng say he has already done?', o: ['Replaced a part', 'Returned the product to the store', 'Sent the product for repair', 'Called customer support'], ex: 'I have already replaced the filter。' },
        { q: 'What information is Mr. Ng unable to provide?', o: ['The serial number', 'The date of purchase', 'The proof of purchase', 'The model number'], ex: '序號標籤磨損，看不到序號。' },
      ],
    },
    {
      docs: [
        {
          label: 'Announcement',
          text: `Lakeside Marathon — Sunday, May 5

Choose your race:
Full Marathon (42 km) — starts 6:30 A.M. — $70
Half Marathon (21 km) — starts 7:00 A.M. — $50
10K Fun Run — starts 8:00 A.M. — $30

Early registration (by March 31): $10 off any race. All participants receive a T-shirt and a finisher's medal.

Race packets can be picked up at City Sports Hall on May 3 or 4, 10 A.M.–6 P.M. No packet pickup on race day.`,
        },
        {
          label: 'Registration confirmation',
          text: `Registration Confirmation #LM-2291

Name: Hannah Cole
Race: Half Marathon
T-shirt size: M
Registered: April 12
Amount paid: $50
Emergency contact: Mark Cole`,
        },
        {
          label: 'E-mail',
          text: `To: info@lakesidemarathon.example
From: Hannah Cole
Date: April 28
Subject: Packet pickup

Hello,

I am registered for the half marathon, but I will be on a business trip from May 2 to May 4 and won't be back until late on the 4th. Is there any way I can collect my race packet on the morning of the race? If not, could my husband, Mark, pick it up for me?

Also, I'd like to change my T-shirt size to small if possible.

Thanks,
Hannah Cole`,
        },
      ],
      qs: [
        { q: 'What is true about all of the races?', o: ['Participants receive a medal.', 'They start at the same time.', 'They cost the same amount.', 'They end at City Sports Hall.'], ex: 'All participants receive a T-shirt and a finisher\'s medal。' },
        { q: 'Why did Ms. Cole not receive a discount?', o: ['She registered after March 31.', 'She chose the half marathon.', 'She paid by credit card.', 'She is not a local resident.'], ex: '早鳥優惠到 3/31，她 4/12 才報名，付了原價 $50（需對照兩篇）。' },
        { q: "What time will Ms. Cole's race begin?", o: ['6:30 A.M.', '7:00 A.M.', '8:00 A.M.', '10:00 A.M.'], a: 1, keep: true, ex: '她報名半馬，半馬 7:00 起跑。' },
        { q: 'What problem does Ms. Cole mention?', o: ['She will be away on the pickup dates.', 'She cannot run on May 5.', 'She paid the wrong amount.', 'She lost her confirmation number.'], ex: '她 5/2–5/4 出差，領物資的日子是 5/3、5/4。' },
        { q: 'Based on the announcement, how will her first request most likely be answered?', o: ['It will be refused.', 'It will be accepted for a fee.', 'It will be passed to her husband.', 'It will require a new registration.'], ex: '她想比賽當天早上領，但公告寫 No packet pickup on race day（需對照三篇）。' },
      ],
    },
    {
      docs: [
        {
          label: 'Listing',
          text: `For Rent: Two-Bedroom Apartment, 18 Maple Street

Second floor, 75 square meters, newly renovated kitchen, balcony facing the park.
Rent: $1,450 per month, water included; electricity and Internet paid by tenant.
Available from June 1. Minimum lease: one year.
Pets: small cats only.
Ten-minute walk to Central Station.

Contact: Mila Novak, Greenleaf Property, mila@greenleaf.example`,
        },
        {
          label: 'E-mail',
          text: `To: Mila Novak
From: Ethan Brooks
Date: May 6
Subject: 18 Maple Street

Dear Ms. Novak,

I'm interested in the apartment on Maple Street. I'm moving to the city for a new job that starts on June 3, so the timing would be perfect. I would like to sign a one-year lease.

I have a small dog, though — would that be a problem? I'd also like to know whether parking is available. Could I view the apartment this Saturday?

Ethan Brooks`,
        },
        {
          label: 'E-mail',
          text: `To: Ethan Brooks
From: Mila Novak
Date: May 7
Subject: RE: 18 Maple Street

Dear Mr. Brooks,

Thank you for your interest. I'm sorry, but the owner does not allow dogs in the building. However, we manage another two-bedroom apartment at 42 Cedar Road that accepts pets of all kinds. It's slightly smaller and the rent is $1,380, but it includes a parking space. It is also available from June 1.

I can show you both apartments on Saturday at 11 A.M. Please let me know.

Mila Novak`,
        },
      ],
      qs: [
        { q: 'What is included in the rent at 18 Maple Street?', o: ['Water', 'Electricity', 'Internet', 'Parking'], ex: 'water included；電費與網路由房客付。' },
        { q: 'Why is the Maple Street apartment unsuitable for Mr. Brooks?', o: ['He owns a dog.', 'He needs it before June.', 'He wants a shorter lease.', 'It is too far from his office.'], ex: '那裡只能養小型貓，而他養狗（需對照兩篇）。' },
        { q: 'What is suggested about Mr. Brooks?', o: ['He accepts the minimum lease term.', 'He has visited the apartment before.', 'He works at Central Station.', 'He is looking for a three-bedroom apartment.'], ex: '最低租期一年，他說想簽一年約。' },
        { q: 'What advantage does the Cedar Road apartment have?', o: ['It includes a parking space.', 'It is larger.', 'It has a balcony.', 'It is closer to the station.'], ex: 'Cedar Road 那間附停車位，也正好回答他問的停車問題。它其實比較小。' },
        { q: 'What does Ms. Novak offer to do?', o: ['Show him two apartments on the same day', 'Lower the rent at Maple Street', 'Ask the owner to allow dogs', 'Move the start date to June 3'], ex: '週六 11 點可以帶他看兩間。' },
      ],
    },
    {
      docs: [
        {
          label: 'Memo',
          text: `To: All Sales Staff
From: Karen Liu, Sales Director
Date: September 2
Re: Quarterly sales award

I'm pleased to announce that the third-quarter sales award goes to the Eastern Region team, which increased sales by 22 percent. The team will be recognized at the company dinner on September 20, and each member will receive an extra day of paid leave.

Congratulations to team leader Marcus Webb and his colleagues.`,
        },
        {
          label: 'Schedule',
          text: `Company Dinner — Friday, September 20
Grand Palace Hotel, Crystal Ballroom

6:30 P.M. — Reception
7:15 P.M. — Welcome speech: CEO Howard Price
7:30 P.M. — Dinner
8:30 P.M. — Award presentations: Karen Liu
9:00 P.M. — Live music`,
        },
        {
          label: 'E-mail',
          text: `To: Karen Liu
From: Marcus Webb
Date: September 10
Subject: Company dinner

Hi Karen,

Thank you again for the award; the whole team is thrilled. Unfortunately, I have to fly to Singapore for a client meeting that evening, and my flight leaves at 9:15 P.M. I'll need to leave the hotel by 7:45.

Would it be possible to present our award before dinner instead? If not, could my colleague Jenna Ortiz accept it on behalf of the team?

Best,
Marcus`,
        },
      ],
      qs: [
        { q: 'Why is the Eastern Region team receiving an award?', o: ['For increasing sales', 'For finding new clients', 'For reducing costs', 'For completing a project early'], ex: '第三季業績成長 22%。' },
        { q: 'What will members of the team receive?', o: ['An extra day off', 'A cash bonus', 'A trip to Singapore', 'A dinner voucher'], ex: 'each member will receive an extra day of paid leave。' },
        { q: 'Who will present the awards at the dinner?', o: ['Karen Liu', 'Howard Price', 'Marcus Webb', 'Jenna Ortiz'], ex: '行程表：8:30 頒獎，頒獎人 Karen Liu。' },
        { q: 'Why does Mr. Webb ask for a change?', o: ['He must leave before the awards are presented.', 'He will arrive after dinner begins.', 'He wants to give a speech.', 'His team cannot attend.'], ex: '他 7:45 就得離開，而頒獎在 8:30（需對照兩篇）。' },
        { q: 'Who might accept the award for the team?', o: ['A colleague of Mr. Webb', 'The CEO', 'A client from Singapore', 'The hotel manager'], ex: '若無法提前，他請同事 Jenna Ortiz 代表領獎。' },
      ],
    },
  ],
}
