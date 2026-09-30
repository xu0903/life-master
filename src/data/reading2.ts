import type { RawTest } from './reading'

// 原創模擬題，題型與題數比照多益閱讀測驗（Part 5–7，共 100 題）。選項第一個是正確答案，載入時會打散。
export const TEST_2: RawTest = {
  id: 'r2',
  name: '模擬試題 2',
  part5: [
    { q: 'The board of directors will ------- the proposal at its next meeting.', o: ['consider', 'considers', 'considering', 'consideration'], ex: '助動詞 will 後面接原形動詞 consider。' },
    { q: 'Mr. Dubois asked the interns to complete the survey by -------.', o: ['themselves', 'them', 'their', 'they'], ex: 'by themselves = 靠他們自己、獨力完成。' },
    { q: 'The factory has reduced its energy ------- by 15 percent this year.', o: ['consumption', 'consume', 'consumer', 'consumed'], ex: 'energy consumption = 能源消耗量，its 後面需要名詞。' },
    { q: 'Tickets for the charity dinner can be purchased ------- online or at the box office.', o: ['either', 'neither', 'both', 'whether'], ex: 'either A or B = A 或 B 皆可。both 要搭配 and。' },
    { q: 'The product launch was postponed ------- a delay in manufacturing.', o: ['because of', 'because', 'so that', 'even though'], ex: '空格後是名詞片語 a delay，要用介系詞片語 because of；because 後面接子句。' },
    { q: 'Ms. Rivera is the most ------- member of the legal department.', o: ['experienced', 'experience', 'experiencing', 'experiences'], ex: 'the most + 形容詞；experienced = 經驗豐富的。' },
    { q: 'All visitors are required to ------- in at the security desk.', o: ['sign', 'write', 'note', 'mark'], ex: 'sign in = 簽到、登記進入。' },
    { q: "The CEO's speech was ------- by a short video about the company's history.", o: ['followed', 'following', 'follow', 'follows'], ex: 'be followed by = 之後接著是…，被動語態用過去分詞。' },
    { q: '------- the merger is finalized, the two companies will share one headquarters.', o: ['Once', 'Whereas', 'Rather', 'Yet'], ex: 'Once + 子句 = 一旦…就…。' },
    { q: 'The accounting department is located ------- the hall from the cafeteria.', o: ['across', 'among', 'between', 'upon'], ex: 'across the hall from… = 在…的走廊對面。' },
    { q: 'Our technicians respond ------- to all service requests.', o: ['promptly', 'prompt', 'promptness', 'prompted'], ex: '修飾動詞 respond 用副詞 promptly（迅速地）。' },
    { q: 'The manager was ------- to learn that sales had doubled.', o: ['delighted', 'delighting', 'delight', 'delightful'], ex: '人「感到」高興用過去分詞 delighted；delightful 是形容事物令人愉快。' },
    { q: 'Please keep your receipt as ------- of purchase.', o: ['proof', 'prove', 'proven', 'proving'], ex: 'proof of purchase = 購買證明，as 後面接名詞。' },
    { q: 'The training manual is ------- being revised by the HR team.', o: ['currently', 'current', 'currency', 'currents'], ex: '修飾動詞片語 is being revised 用副詞 currently（目前）。' },
    { q: 'The company offers flexible hours ------- employees can balance work and family.', o: ['so that', 'in order to', 'due to', 'as well as'], ex: 'so that + 子句 = 以便…。in order to 後面要接原形動詞，due to 接名詞。' },
    { q: 'Few of the applicants had the qualifications ------- for the position.', o: ['required', 'requiring', 'require', 'requirement'], ex: '資格是「被要求的」，用過去分詞後位修飾：qualifications (that are) required。' },
    { q: 'The new printer is much more ------- than the old one.', o: ['reliable', 'rely', 'reliably', 'reliance'], ex: 'be 動詞後的 more + 形容詞；reliable = 可靠的。' },
    { q: 'Mr. Ito will be away on business, so Ms. Park will attend the meeting on his -------.', o: ['behalf', 'place', 'account', 'part'], ex: 'on one\'s behalf = 代表某人。「代替他」若用 place 要說 in his place。' },
    { q: 'By next June, Ms. Lopez ------- for the company for ten years.', o: ['will have worked', 'has worked', 'worked', 'is working'], ex: 'By + 未來時間點，表示「到那時將已經…」，用未來完成式。' },
    { q: 'The seminar was so ------- that many attendees asked for a follow-up session.', o: ['informative', 'inform', 'information', 'informatively'], ex: 'so + 形容詞 + that；informative = 內容充實、有收穫的。' },
    { q: 'Orders ------- before noon will be shipped the same day.', o: ['placed', 'placing', 'place', 'to place'], ex: '訂單是「被下的」，用過去分詞修飾：Orders (that are) placed before noon。' },
    { q: 'The supervisor reminded the staff ------- their time sheets on Friday.', o: ['to submit', 'submitting', 'submit', 'submitted'], ex: 'remind + 人 + to + 原形動詞。' },
    { q: '------- interested in joining the committee should contact Ms. Webb.', o: ['Anyone', 'Whoever', 'Anything', 'Other'], ex: 'Anyone (who is) interested in… = 任何有興趣的人。Whoever 後面要直接接動詞。' },
    { q: 'The budget for the project is limited; -------, we must choose suppliers carefully.', o: ['therefore', 'however', 'otherwise', 'moreover'], ex: '預算有限 →「因此」要謹慎選擇供應商，前後是因果關係。' },
    { q: 'The restaurant has earned a ------- for excellent service.', o: ['reputation', 'repetition', 'recreation', 'regulation'], ex: 'earn a reputation for = 以…贏得名聲。' },
    { q: 'The report must be approved by the director ------- it is sent to the client.', o: ['before', 'during', 'despite', 'prior'], ex: '空格後是子句，用連接詞 before；during / despite 接名詞，prior 要寫成 prior to。' },
    { q: 'Employee ------- has improved since the company introduced flexible schedules.', o: ['satisfaction', 'satisfy', 'satisfied', 'satisfactory'], ex: 'employee satisfaction = 員工滿意度，當主詞需要名詞。' },
    { q: 'The technician explained the procedure ------- clearly that everyone understood.', o: ['so', 'such', 'very', 'too'], ex: 'so + 副詞 + that = 如此…以至於。such 後面要接名詞。' },
    { q: 'Parking permits are ------- only to full-time staff.', o: ['available', 'capable', 'possible', 'eligible'], ex: 'be available to + 人 = 可供某人取得。eligible 的主詞要是人（staff are eligible for permits）。' },
    { q: 'The two firms have agreed to ------- on a new research project.', o: ['collaborate', 'collaboration', 'collaborative', 'collaboratively'], ex: 'agree to + 原形動詞；collaborate on = 在…上合作。' },
  ],
  part6: [
    {
      docs: [
        {
          label: 'Letter',
          text: `Dear Subscriber,

Your subscription to Business Horizons magazine will {1} on August 31. To make sure you do not miss an issue, we invite you to renew today. If you renew before August 15, you will receive twelve issues for the price of ten. {2}

Renewing is easy. Simply return the {3} form in the postage-paid envelope, or visit our Web site.

Thank you for being a loyal reader. We look forward to {4} you for another year.

Sincerely,
The Business Horizons Team`,
        },
      ],
      qs: [
        { q: '', o: ['expire', 'expired', 'expiring', 'expiration'], ex: '助動詞 will 後面接原形動詞 expire（到期）。' },
        {
          q: '',
          o: [
            'You will also get free access to our online archive.',
            'The magazine was founded in 1988.',
            'Our offices are closed on weekends.',
            'Your last issue was damaged in the mail.',
          ],
          ex: '前一句在講提早續訂的優惠，also 承接再補充一項好處最通順。',
        },
        { q: '', o: ['enclosed', 'enclosing', 'enclose', 'enclosure'], ex: '表格是「被附在信裡的」，用過去分詞：the enclosed form（隨信附上的表格）。' },
        { q: '', o: ['serving', 'serve', 'served', 'serves'], ex: 'look forward to 的 to 是介系詞，後面接動名詞 serving。' },
      ],
    },
    {
      docs: [
        {
          label: 'E-mail',
          text: `To: All employees
From: IT Department
Subject: E-mail system upgrade

The company e-mail system will be upgraded this Saturday between 8:00 P.M. and midnight. {1} this period, you will not be able to send or receive messages. The upgrade will provide more storage space and {2} security.

No action is required on your part. {3} If you experience any problems when you log in on Monday, please contact the help desk at extension 300.

We appreciate your {4}.`,
        },
      ],
      qs: [
        { q: '', o: ['During', 'While', 'Among', 'Between'], ex: 'During + 名詞（this period）= 在這段期間；While 後面接子句。' },
        { q: '', o: ['improved', 'improve', 'improves', 'improvement'], ex: '修飾名詞 security，用過去分詞當形容詞：improved security（更好的安全性）。' },
        {
          q: '',
          o: [
            'However, we recommend saving any unfinished drafts before you leave on Friday.',
            'The help desk is hiring two technicians.',
            'Storage space has been a problem since last year.',
            'Please reply to this message by Saturday.',
          ],
          ex: '前一句說「不需要做任何事」，However 轉折提出一個建議最合理；要求回信則與前一句矛盾。',
        },
        { q: '', o: ['patience', 'patient', 'patiently', 'patients'], ex: 'your 後面接名詞；We appreciate your patience = 感謝您的耐心。patients 是病人。' },
      ],
    },
    {
      docs: [
        {
          label: 'Advertisement',
          text: `Are you planning a company event? Let Juniper Catering take care of the food.

{1} it is a breakfast meeting for ten or a banquet for five hundred, our chefs will create a menu to suit your needs and budget. All of our dishes are prepared with fresh, locally grown {2}. {3} We also offer vegetarian and gluten-free options.

Call 555-0188 today for a free {4}. Mention this advertisement and receive 10 percent off your first order.`,
        },
      ],
      qs: [
        { q: '', o: ['Whether', 'Either', 'Neither', 'Unless'], ex: 'Whether A or B = 不論是 A 還是 B，引導讓步子句。Either 不能引導子句。' },
        { q: '', o: ['ingredients', 'instruments', 'appliances', 'containers'], ex: '料理用新鮮、當地種植的「食材」：ingredients。' },
        {
          q: '',
          o: [
            'Our staff will even set up and clean up, so you can focus on your guests.',
            'We are currently closed for renovations.',
            'The banquet was attended by five hundred people.',
            'Breakfast is the most important meal of the day.',
          ],
          ex: '整段在介紹外燴服務的優點，補充「連場地佈置與清理都包辦」最符合廣告語氣。',
        },
        { q: '', o: ['estimate', 'estimated', 'estimating', 'estimates'], ex: 'a free + 單數名詞；a free estimate = 免費估價。' },
      ],
    },
    {
      docs: [
        {
          label: 'Memo',
          text: `To: Sales staff
From: Finance Department
Re: New travel expense procedure

Starting next month, all travel expenses must be {1} through the new online system, ExpenseTrack. Paper forms will no longer be accepted.

To submit a claim, log in with your employee ID, enter the details of each expense, and upload a photo of the receipt. {2} Claims submitted by the 25th of the month will be {3} with your next salary payment.

A short training video is available on the company intranet. We {4} encourage everyone to watch it before filing a first claim.`,
        },
      ],
      qs: [
        { q: '', o: ['submitted', 'submitting', 'submission', 'submit'], ex: '費用是「被提交」：must be + 過去分詞 submitted。' },
        {
          q: '',
          o: [
            'Claims without receipts cannot be processed.',
            'The old system was installed in 2015.',
            'Sales staff travel more than other employees.',
            'Salaries will be reviewed at the end of the year.',
          ],
          ex: '前一句要求上傳收據照片，接著說明「沒有收據無法處理」最連貫。',
        },
        { q: '', o: ['reimbursed', 'recruited', 'reminded', 'reserved'], ex: 'reimburse = 報銷、償還墊付的費用。' },
        { q: '', o: ['strongly', 'strong', 'strength', 'strengthen'], ex: '修飾動詞 encourage 用副詞；strongly encourage = 強烈建議。' },
      ],
    },
  ],
  part7: [
    {
      docs: [
        {
          label: 'Coupon',
          text: `Pedal Works Bicycle Shop
SPRING TUNE-UP SPECIAL

Get your bike ready for the season!
Basic tune-up: $35 (regular price $50)
Includes brake and gear adjustment, tire inflation, and chain cleaning.

Valid March 1–31. One coupon per customer. Not valid for electric bicycles.
Appointments recommended: call 555-0117.`,
        },
      ],
      qs: [
        { q: 'What is being offered at a reduced price?', o: ['A maintenance service', 'A new bicycle', 'A set of tires', 'A cycling class'], ex: 'tune-up 是保養調校服務，原價 $50 特價 $35。' },
        { q: 'What is stated about the coupon?', o: ['It cannot be used for certain bicycles.', 'It is valid all year.', 'It can be used several times.', 'It requires an appointment.'], ex: 'Not valid for electric bicycles。預約只是「建議」，不是必要條件。' },
      ],
    },
    {
      docs: [
        {
          label: 'Text-message chain',
          text: `Laura Chen (4:41 P.M.)
Ben, are you still at the office? The client just asked for the revised contract tonight.

Ben Ortiz (4:43 P.M.)
I'm here. I finished the changes an hour ago, but Mr. Grant hasn't signed off on them yet.

Laura Chen (4:44 P.M.)
He's in meetings until 6. Can you leave a copy on his desk and send me the file?

Ben Ortiz (4:45 P.M.)
Will do. Should I tell the client to expect it this evening?

Laura Chen (4:46 P.M.)
Leave that to me. I'll call her now.`,
        },
      ],
      qs: [
        { q: 'What is suggested about the contract?', o: ["It needs Mr. Grant's approval.", 'It was sent to the client yesterday.', 'It has not been revised yet.', 'It was written by the client.'], ex: 'sign off on = 簽核、批准。Ben 已改完，但 Mr. Grant 還沒核准。' },
        { q: 'At 4:46 P.M., what does Ms. Chen most likely mean when she writes, "Leave that to me"?', o: ['She will contact the client herself.', 'She will revise the contract.', 'She wants Mr. Ortiz to go home.', 'She will wait outside the meeting.'], ex: 'Ben 問要不要通知客戶，她說「交給我」，接著說 I\'ll call her now。' },
      ],
    },
    {
      docs: [
        {
          label: 'Notice',
          text: `To our valued customers:

Hartley's Pharmacy will close at 2:00 P.M. on Friday, December 6, so that our staff can attend a training course on our new prescription system. We will reopen at the usual time on Saturday.

If you need a prescription filled on Friday afternoon, our Elm Street branch will be open until 9:00 P.M.`,
        },
      ],
      qs: [
        { q: "Why will Hartley's Pharmacy close early on December 6?", o: ['Employees will receive training.', 'The store is being renovated.', 'It is a public holiday.', 'A new branch is opening.'], ex: 'so that our staff can attend a training course：員工要參加新系統的訓練。' },
        { q: 'What are customers advised to do on Friday afternoon?', o: ['Visit another location', 'Order prescriptions online', 'Come back on Sunday', 'Call the pharmacy before 2:00 P.M.'], ex: '週五下午需要領藥的人可以去 Elm Street 分店，開到晚上九點。' },
      ],
    },
    {
      docs: [
        {
          label: 'E-mail',
          text: `To: All Department Heads
From: Grace Kimura, Facilities
Date: April 8
Subject: Office supplies orders

Dear colleagues,

Beginning May 1, office supplies will be ordered once a month instead of weekly. This change will reduce delivery charges and allow us to get bulk discounts from our supplier. Each department should send its order to me by the 20th of the month; supplies will arrive during the first week of the following month.

Urgent requests can still be made, but they must be approved by your division director.

Please share this information with your teams.

Grace`,
        },
      ],
      qs: [
        { q: 'What is the purpose of the e-mail?', o: ['To announce a change in a procedure', 'To introduce a new supplier', 'To report a late delivery', 'To ask for budget proposals'], ex: '辦公用品改成每月訂購一次，是流程的變更。' },
        { q: 'What is one reason for the change?', o: ['To lower costs', 'To reduce paper waste', 'To speed up deliveries', 'To meet a supplier\'s request'], ex: '可以減少運費並取得大量採購折扣，也就是降低成本。' },
        { q: 'What is required for urgent orders?', o: ["A director's approval", 'An extra fee', 'A written form', 'Two days\' notice'], ex: 'they must be approved by your division director。' },
      ],
    },
    {
      docs: [
        {
          label: 'Web page',
          text: `The Glasshouse — Event Space for Hire

Located on the top floor of the historic Wexford Building, The Glasshouse offers stunning views of the river and the city skyline. The space holds up to 150 guests and is ideal for receptions, product launches, and company parties.

Rental includes tables, chairs, a sound system, and use of our kitchen. Catering is not provided, but we can recommend several excellent local companies.

Rates: Monday–Thursday, $1,200 per evening; Friday–Sunday, $1,800 per evening. A 25 percent deposit is required to secure your date.`,
        },
      ],
      qs: [
        { q: 'What is indicated about The Glasshouse?', o: ['It is in an old building.', 'It is located beside an airport.', 'It can hold 250 guests.', 'It charges the same rate every day.'], ex: 'the historic Wexford Building = 具歷史的建築。容納 150 人，平日與週末價格不同。' },
        { q: 'What is NOT included in the rental?', o: ['Food service', 'Furniture', 'Audio equipment', 'Kitchen access'], ex: 'Catering is not provided：不提供餐飲，只能推薦外燴公司。桌椅、音響、廚房都有包含。' },
        { q: 'What must customers do to reserve a date?', o: ['Pay part of the fee in advance', 'Visit the space in person', 'Hire a recommended caterer', 'Book at least a month ahead'], ex: 'A 25 percent deposit is required：要先付 25% 訂金。' },
      ],
    },
    {
      docs: [
        {
          label: 'Article',
          text: `Local Firm Wins Green Award

CEDAR FALLS — Packaging company Ecobox has received this year's Regional Green Business Award. The judges praised the firm for cutting its waste by half over the past three years and for switching its delivery vans to electric models.

Ecobox founder Paul Andersson accepted the award at a ceremony on Tuesday evening. "This belongs to our employees," he said. "Most of our best ideas come from the factory floor."

The company, which employs 85 people, plans to open a recycling center next to its plant in the autumn.`,
        },
      ],
      qs: [
        { q: 'Why did Ecobox receive the award?', o: ['For reducing its impact on the environment', 'For creating the most local jobs', 'For designing a new type of van', 'For its rapid sales growth'], ex: '評審稱讚它三年內廢棄物減半，並把貨車換成電動車。' },
        { q: 'What does Mr. Andersson suggest about his employees?', o: ['They contribute valuable ideas.', 'They attended the ceremony.', 'They will receive a bonus.', 'They work mostly from home.'], ex: 'Most of our best ideas come from the factory floor：好點子多半來自第一線員工。' },
        { q: 'What does Ecobox plan to do?', o: ['Open a new facility', 'Move to a larger city', 'Hire 85 more workers', 'Enter another competition'], ex: '秋天要在工廠旁邊開一座回收中心。85 是目前的員工人數。' },
      ],
    },
    {
      docs: [
        {
          label: 'E-mail',
          text: `To: Members of the Oakwood Business Association
From: Sandra Moreau, President
Subject: Annual dinner

Dear members,

I am pleased to invite you to our annual dinner on Friday, November 22, at the Regent Hotel. —[1]— The evening will begin with a reception at 6:30 P.M., followed by dinner at 7:30.

This year's guest speaker is Thomas Varga, founder of the online retailer Bluecart. —[2]— He will talk about how small businesses can compete with large companies online.

Tickets are $65 per person. Tables of ten may be reserved for $600. —[3]— To book, please contact our secretary, Mr. Hall, by November 8.

As in previous years, part of the proceeds will go to the Oakwood Youth Training Fund. —[4]— I hope to see you there.

Sandra Moreau`,
        },
      ],
      qs: [
        { q: 'What is the purpose of the e-mail?', o: ['To invite members to an event', 'To introduce a new president', 'To ask for donations', 'To announce a change of venue'], ex: '第一句：I am pleased to invite you to our annual dinner。' },
        { q: 'Who is Mr. Varga?', o: ['A company founder', 'A hotel manager', 'The association\'s secretary', 'A youth trainer'], ex: 'Thomas Varga, founder of the online retailer Bluecart。秘書是 Mr. Hall。' },
        { q: 'What is indicated about the dinner?', o: ['It supports a charitable cause.', 'It is being held for the first time.', 'It is free for members.', 'It begins at 8:30 P.M.'], ex: '部分收益會捐給 Oakwood Youth Training Fund。它是年度晚宴（annual），票價 $65。' },
        { q: 'In which of the positions marked [1], [2], [3], and [4] does the following sentence best belong?\n"He started the company in his garage twelve years ago."', o: ['[1]', '[2]', '[3]', '[4]'], a: 1, keep: true, ex: 'He 指 Thomas Varga、the company 指 Bluecart，要緊接在介紹他的那一句後面，也就是 [2]。' },
      ],
    },
    {
      docs: [
        {
          label: 'Online chat discussion',
          text: `Monica Reyes (10:02 A.M.)
Morning, everyone. Quick update on the Westgate store opening. The contractor says the flooring won't be finished until the 14th.

Peter Shaw (10:04 A.M.)
That's two days later than planned. Will we still open on the 20th?

Monica Reyes (10:05 A.M.)
We should, as long as the shelves are installed right after. Yuki, when can your team start?

Yuki Arai (10:07 A.M.)
We can start on the 15th. It takes three days, so we'd be done on the 17th.

Peter Shaw (10:08 A.M.)
That leaves only two days to stock the shelves. I'll ask for extra staff from the Riverside store.

Monica Reyes (10:09 A.M.)
Good idea. And the opening-day advertisements?

Yuki Arai (10:10 A.M.)
Already sent to the newspaper. They run this weekend.

Monica Reyes (10:11 A.M.)
Then we're on track. Thanks, both.`,
        },
      ],
      qs: [
        { q: 'What is mainly being discussed?', o: ['Preparations for a store opening', 'Complaints about a contractor', 'The design of an advertisement', 'Sales results at the Riverside store'], ex: '整段都在討論 Westgate 新店開幕前的地板、層架、上架與廣告進度。' },
        { q: 'What problem does Ms. Reyes mention?', o: ['Some work is behind schedule.', 'A newspaper made an error.', 'Some shelves are damaged.', 'A store has too few customers.'], ex: '地板要到 14 號才完工，比原定晚兩天。' },
        { q: 'What does Mr. Shaw say he will do?', o: ['Request additional workers', 'Postpone the opening', 'Install the shelves himself', 'Call the contractor'], ex: 'I\'ll ask for extra staff from the Riverside store：向另一家店借人手。' },
        { q: 'At 10:11 A.M., what does Ms. Reyes most likely mean when she writes, "Then we\'re on track"?', o: ['The store can open as planned.', 'The advertisements need to be changed.', 'The meeting has gone on too long.', 'The flooring has been completed.'], ex: 'on track = 進度符合計畫。確認各項工作都趕得上之後，表示 20 號能如期開幕。' },
      ],
    },
    {
      docs: [
        {
          label: 'Policy',
          text: `Trailhead Outdoor Gear — Return Policy

We want you to be completely satisfied with your purchase. Unused items may be returned within 60 days for a full refund, provided that they are in their original packaging and accompanied by a receipt. Without a receipt, we can offer store credit only.

Footwear that has been worn outdoors cannot be returned unless it is defective. Items bought during clearance sales are final and cannot be returned or exchanged.

For online orders, print a return label from our Web site. Return shipping is free for members of our Trail Club.`,
        },
      ],
      qs: [
        { q: 'What is required for a full refund?', o: ['A receipt', 'A Trail Club membership', 'A return label', 'A manager\'s signature'], ex: '全額退款需未使用、原包裝並附收據；沒有收據只能換購物金。' },
        { q: 'What is stated about clearance items?', o: ['They cannot be returned.', 'They can be exchanged within 60 days.', 'They are sold only online.', 'They are refunded as store credit.'], ex: 'Items bought during clearance sales are final：出清商品不能退換。' },
        { q: 'Who can return online orders without paying for shipping?', o: ['Trail Club members', 'All customers', 'Customers with defective footwear', 'Customers who kept the packaging'], ex: 'Return shipping is free for members of our Trail Club。' },
      ],
    },
    {
      docs: [
        {
          label: 'Article',
          text: `Employee Spotlight: Hiroshi Maeda

This month we feature Hiroshi Maeda, who joined our Osaka design team eight years ago after studying engineering in Kyoto. Hiroshi led the development of the X5 coffee maker, which became our best-selling product last year.

Colleagues describe him as patient and generous with his time; he regularly mentors junior designers. Next month, Hiroshi will move to our Toronto office for a one-year assignment to help set up a new design studio. Outside of work, he enjoys hiking and photography.`,
        },
      ],
      qs: [
        { q: 'Where would the article most likely appear?', o: ['In a company newsletter', 'In a travel magazine', 'In a product catalog', 'In a university brochure'], ex: 'Employee Spotlight、our Osaka design team、our best-selling product，都是公司內部刊物的口吻。' },
        { q: 'What is indicated about the X5 coffee maker?', o: ['It sold very well.', 'It was designed in Toronto.', 'It will be released next month.', 'It took eight years to develop.'], ex: '去年成為公司最暢銷的產品。八年是他進公司的時間。' },
        { q: 'What will Mr. Maeda do next month?', o: ['Relocate overseas temporarily', 'Retire from the company', 'Begin studying engineering', 'Launch a photography business'], ex: '下個月調到多倫多辦公室一年，協助成立設計工作室。' },
      ],
    },
    {
      docs: [
        {
          label: 'Invoice',
          text: `Clearview Window Cleaning — Invoice #2207
Date: July 14
Bill to: Fenwick Dental Clinic, 12 Harbor Street
Service date: July 12

Exterior windows, ground floor — $80
Exterior windows, second floor — $110
Interior windows, both floors — $90
Sign cleaning — $30
Total due — $310

Payment is due within 15 days. A late fee of 5 percent applies to overdue accounts. Regular customers who schedule monthly service receive 10 percent off each visit.`,
        },
        {
          label: 'E-mail',
          text: `To: billing@clearview.example
From: Dr. Anita Fenwick
Date: July 16
Subject: Invoice #2207

Hello,

I received your invoice this morning. Your team did a great job, as always. However, I believe there is a mistake. When I booked the service, I asked for the outside windows and the sign only. Your crew did not come inside the clinic, since we were seeing patients all day.

Could you send a corrected invoice? I will pay it as soon as I receive it. I'd also like information about your monthly plan, as we are thinking of having the windows cleaned more often.

Thank you,
Anita Fenwick`,
        },
      ],
      qs: [
        { q: 'When was the work performed?', o: ['July 12', 'July 14', 'July 16', 'July 29'], a: 0, keep: true, ex: 'Service date: July 12。7/14 是開立發票的日期。' },
        { q: 'What is stated about payment?', o: ['Late payments incur an extra charge.', 'It must be made in cash.', 'It is due on the day of service.', 'It can be made in monthly installments.'], ex: 'A late fee of 5 percent applies to overdue accounts：逾期要加收 5%。' },
        { q: 'Why did Dr. Fenwick write the e-mail?', o: ['To report a billing error', 'To complain about poor work', 'To cancel a future appointment', 'To confirm that she has paid'], ex: '她認為帳單有誤：她沒訂室內窗戶清潔，工作人員也沒進診所。' },
        { q: 'What will the total on the corrected invoice most likely be?', o: ['$190', '$220', '$280', '$310'], a: 1, keep: true, ex: '扣掉沒做的 Interior windows $90：310 − 90 = $220（需對照兩篇）。' },
        { q: 'What does Dr. Fenwick request in addition to a new invoice?', o: ['Details about a service plan', 'A different cleaning crew', 'An extension of the payment deadline', 'A copy of an earlier invoice'], ex: '她想了解 monthly plan（每月清潔方案）的資訊。' },
      ],
    },
    {
      docs: [
        {
          label: 'Notice',
          text: `Greenway Apartments — Notice to Residents

The residents' committee is organizing a community garden on the unused land behind Building C. Twenty garden plots will be available, each measuring two by three meters. Plots will be assigned by lottery on April 5. To enter, leave your name and apartment number in the committee's mailbox in the lobby by April 1.

The yearly fee is $30 per plot, which covers water and shared tools. Gardeners must keep their plots tidy and may not use chemical pesticides. A planning meeting for all plot holders will be held on April 12 at 10:00 A.M. in the community room.`,
        },
        {
          label: 'E-mail',
          text: `To: Greenway Residents' Committee
From: Marcus Bell (Apt. C-14)
Date: April 6
Subject: Garden plot

Dear committee,

I was delighted to learn yesterday that I have been given a plot. Thank you for organizing this.

Unfortunately, I will be out of town on the day of the planning meeting. Could my neighbor, Ms. Alvarez from C-16, attend in my place and pass the information on to me? She did not get a plot this year but is keen to help me with mine.

Also, I own a small greenhouse frame, about one meter wide. Would I be allowed to put it on my plot?

Regards,
Marcus Bell`,
        },
      ],
      qs: [
        { q: 'What is the notice mainly about?', o: ['A new shared garden', 'A change in rental fees', 'Repairs to Building C', 'The election of a committee'], ex: '住戶委員會要在 C 棟後面的空地設立社區菜園。' },
        { q: 'What are gardeners prohibited from doing?', o: ['Using certain chemicals', 'Sharing tools', 'Watering in the morning', 'Growing vegetables'], ex: 'may not use chemical pesticides：不可使用化學殺蟲劑。' },
        { q: 'How did Mr. Bell most likely obtain his plot?', o: ['His name was drawn at random.', 'He was the first to apply.', 'He paid a higher fee.', 'He is a member of the committee.'], ex: '公告說 4/5 用抽籤（lottery）分配，他在 4/6 的信中說「昨天」得知分到一塊（需對照兩篇）。' },
        { q: 'When will Mr. Bell be away?', o: ['April 1', 'April 5', 'April 6', 'April 12'], a: 3, keep: true, ex: '他說規劃會議那天不在，公告寫會議是 4/12。' },
        { q: 'What does Mr. Bell ask permission to do?', o: ['Place a structure on his plot', 'Share his plot with two neighbors', 'Pay his fee at a later date', 'Exchange his plot for a larger one'], ex: '他想在菜園放一個小型溫室骨架（greenhouse frame）。' },
      ],
    },
    {
      docs: [
        {
          label: 'Web page',
          text: `WorkNest Coworking — Membership Plans

Flex — $120/month — Access on weekdays, 9 A.M.–6 P.M.; any open desk
Dedicated — $220/month — Your own desk, 24-hour access, locker
Team Room — $700/month — Private office for up to four people, 24-hour access, 10 hours of meeting-room use

All plans include high-speed Internet, printing (up to 100 pages a month), and free coffee and tea. Meeting rooms can be booked by Flex and Dedicated members for $15 an hour. New members receive their first week free.`,
        },
        {
          label: 'Application form',
          text: `WorkNest Membership Application

Name: Julia Novak
Company: Novak Translation Services
Plan selected: Dedicated
Start date: September 1
How did you hear about us? A colleague, Peter Yoon, who is a current member
Comments: I often work late at night, so round-the-clock access is important to me. I also meet clients about twice a month.`,
        },
        {
          label: 'E-mail',
          text: `To: Julia Novak
From: Emre Demir, WorkNest Community Manager
Date: August 27
Subject: Welcome

Dear Ms. Novak,

Thank you for joining WorkNest. Your desk, number 18, is by the window on the second floor, and your access card will be waiting at reception on your start date.

Since you mentioned client meetings, you may like to know that Meeting Room 2 is the quietest; you can reserve it through our app. Also, because you were referred by a current member, both you and Mr. Yoon will receive a $25 credit on next month's bill.

We hold a members' breakfast on the first Friday of each month. I hope you can join us.

Best,
Emre Demir`,
        },
      ],
      qs: [
        { q: 'What is included in all WorkNest plans?', o: ['A limited amount of printing', 'A private locker', '24-hour access', 'Free use of meeting rooms'], ex: '所有方案都含網路、每月 100 頁列印、咖啡和茶。置物櫃與 24 小時進出只有部分方案有。' },
        { q: 'Why did Ms. Novak most likely choose the Dedicated plan?', o: ['It allows access at any time.', 'It is the least expensive.', 'It includes a private office.', 'It offers free meeting rooms.'], ex: '她常工作到深夜，需要 round-the-clock access；Flex 只能平日白天使用。' },
        { q: 'How much will Ms. Novak pay per hour to use a meeting room?', o: ['$10', '$15', '$25', 'Nothing'], a: 1, keep: true, ex: '她選 Dedicated 方案，網頁寫 Flex 和 Dedicated 會員訂會議室每小時 $15（需對照兩篇）。' },
        { q: 'What will Ms. Novak receive on September 1?', o: ['An access card', 'A locker key by mail', 'A refund', 'A breakfast invitation'], ex: '門禁卡會在她的開始日期（9/1）放在櫃台。' },
        { q: 'Why will Mr. Yoon receive a credit?', o: ['He recommended WorkNest to Ms. Novak.', 'He changed his membership plan.', 'He has been a member for a year.', 'He booked Meeting Room 2.'], ex: '因為 Ms. Novak 是由現有會員 Mr. Yoon 介紹的，兩人各得 $25 折抵。' },
      ],
    },
    {
      docs: [
        {
          label: 'E-mail',
          text: `To: Rosa Delgado, Café Luna
From: Henrik Falk, Northern Roast Coffee
Date: February 2
Subject: New price list

Dear Ms. Delgado,

Thank you for being a customer of Northern Roast for the past four years. Because of rising shipping costs, we have had to adjust some of our prices as of March 1. The new list is attached. As you will see, the price of our House Blend has not changed.

To thank long-standing customers, we are offering free delivery on all orders placed in February. Orders of 20 kg or more will also receive a free sample bag of our new Ethiopian roast.

Best regards,
Henrik Falk`,
        },
        {
          label: 'Price list',
          text: `Northern Roast Coffee — Wholesale Prices (per kg)
Effective March 1

House Blend — $14.00
Espresso Dark — $16.50 (previously $15.00)
Colombian Single Origin — $19.00 (previously $18.00)
Decaf Blend — $17.00 (previously $16.00)

Minimum order: 5 kg. Standard delivery: $12 per order.`,
        },
        {
          label: 'E-mail',
          text: `To: Henrik Falk
From: Rosa Delgado
Date: February 10
Subject: Order

Dear Mr. Falk,

Thanks for letting us know. I'd like to place an order before the new prices take effect: 15 kg of Espresso Dark and 10 kg of Decaf Blend. Please deliver on a weekday morning, before we open at 8.

One question: several customers have asked for the Colombian coffee. Could we order just 2 kg of it to try, or does the minimum apply to each type of coffee?

Regards,
Rosa Delgado`,
        },
      ],
      qs: [
        { q: 'Why did Mr. Falk write to Ms. Delgado?', o: ['To notify her of price changes', 'To apologize for a late shipment', 'To ask her to pay an invoice', 'To announce that a product is discontinued'], ex: '因運費上漲，3/1 起部分價格調整，並附上新價目表。' },
        { q: 'Which product will cost the same after March 1?', o: ['House Blend', 'Espresso Dark', 'Colombian Single Origin', 'Decaf Blend'], ex: '信中說 House Blend 價格不變，價目表上也只有它沒有標「previously」。' },
        { q: "What is suggested about Ms. Delgado's order?", o: ['It will include a sample of a new product.', 'It will be charged a $12 delivery fee.', 'It will be billed at the March prices.', 'It is below the minimum order size.'], ex: '她訂 15 + 10 = 25 kg，超過 20 kg 可獲贈新品試用包；二月下單免運，且適用舊價格。' },
        { q: 'How much per kilogram will Ms. Delgado most likely pay for Espresso Dark?', o: ['$14.00', '$15.00', '$16.50', '$17.00'], a: 1, keep: true, ex: '她在 2/10 下單，新價 3/1 才生效，所以是原價 $15.00（需對照三篇）。' },
        { q: 'What does Ms. Delgado ask about?', o: ['Whether a rule applies to individual products', 'Whether deliveries can be made on weekends', 'Whether the new roast contains caffeine', 'Whether the café can pay in March'], ex: '她想知道 5 kg 的最低訂購量是否每一種咖啡都適用。' },
      ],
    },
    {
      docs: [
        {
          label: 'Web page',
          text: `Harbor City Walking Tours

Old Town History Walk — 2 hours — $20 — Daily at 10:00 A.M.
Street Food Tour — 3 hours — $45 (includes six tastings) — Tue, Thu, Sat at 5:00 P.M.
Harbor Sunset Walk — 1.5 hours — $18 — Fri and Sat at 6:30 P.M.
Museum Quarter Tour — 2.5 hours — $30 (includes museum entry) — Wed and Sun at 1:00 P.M.

Tours run rain or shine. Groups are limited to 12 people. Private tours for companies can be arranged; e-mail groups@harborcitytours.example.`,
        },
        {
          label: 'E-mail',
          text: `To: groups@harborcitytours.example
From: Isabel Castro, Vantage Consulting
Date: May 2
Subject: Private tour

Hello,

Eighteen of our staff will be in Harbor City for a meeting on Thursday, May 23. We would like to book a private tour for that evening, ideally one with food included, since we will not have time for dinner beforehand. Two of our group are vegetarians.

Could you tell me whether this is possible and what it would cost?

Isabel Castro`,
        },
        {
          label: 'E-mail',
          text: `To: Isabel Castro
From: Liam Brady, Harbor City Walking Tours
Date: May 3
Subject: RE: Private tour

Dear Ms. Castro,

Thank you for your inquiry. We would be glad to arrange the tour you describe on May 23. Because of your group's size, we will divide you into two groups, each with its own guide; both will follow the same route and meet at the end. Vegetarian tastings are no problem.

For private bookings we charge the regular price per person, less 10 percent for groups of fifteen or more. To confirm, please pay a deposit of $100 by May 10.

Best regards,
Liam Brady`,
        },
      ],
      qs: [
        { q: 'What is true about all the tours listed on the Web page?', o: ['They take place regardless of the weather.', 'They include food.', 'They are offered every day.', 'They last at least two hours.'], ex: 'Tours run rain or shine = 風雨無阻。' },
        { q: "Which tour will Ms. Castro's group most likely take?", o: ['Street Food Tour', 'Old Town History Walk', 'Harbor Sunset Walk', 'Museum Quarter Tour'], ex: '要週四晚上、含餐點，只有 Street Food Tour 符合（週二四六 5:00 P.M.、含六樣試吃）。' },
        { q: "Why will Ms. Castro's staff be divided into two groups?", o: ['Their number exceeds the usual group limit.', 'Some of them are vegetarians.', 'They will arrive at different times.', 'Only one guide is available.'], ex: '一團上限 12 人，他們有 18 人（需對照網頁與信件）。' },
        { q: "What is suggested about Vantage Consulting's booking?", o: ['It qualifies for a reduced price.', 'It must be paid in full by May 10.', 'It will take place in the morning.', 'It was made too late.'], ex: '15 人以上打九折，他們有 18 人。5/10 前只需付 $100 訂金。' },
        { q: 'What must Ms. Castro do by May 10?', o: ['Make an advance payment', 'Send a list of names', 'Choose a route', 'Confirm the number of vegetarians'], ex: 'please pay a deposit of $100 by May 10。' },
      ],
    },
  ],
}
