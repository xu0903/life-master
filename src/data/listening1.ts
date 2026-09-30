import type { RawListening } from './listening'

// 原創模擬題，比照多益聽力 Part 2–4（Part 1 照片描述需要圖片，暫不收錄）。選項第一個是正確答案，載入時會打散。
export const LISTENING_1: RawListening = {
  id: 'l1',
  name: '聽力試題 1',
  part2: [
    { q: 'When does the staff meeting start?', o: ["At ten o'clock.", 'In the conference room.', 'Yes, I met him.'], ex: 'When 問時間，回答 At ten o\'clock。「會議室」回答的是地點，另一個選項用 met 混淆 meeting。' },
    { q: "Who's responsible for ordering office supplies?", o: ['Ms. Lee handles that.', 'A box of pens.', "It's on the second shelf."], ex: 'Who 問「誰」負責，回答人名。' },
    { q: 'Where should I put these boxes?', o: ['In the storage room, please.', 'They arrived this morning.', "Yes, they're quite heavy."], ex: 'Where 問地點；疑問詞開頭的問句不能用 Yes / No 回答。' },
    { q: 'Would you like coffee or tea?', o: ['Tea would be great, thanks.', 'Yes, I would.', 'At the café downstairs.'], ex: '二選一的問句要選其中一個，不能只回答 Yes。' },
    { q: 'Why was the flight delayed?', o: ['Because of bad weather.', 'At gate twelve.', 'For about two hours.'], ex: 'Why 問原因；For about two hours 回答的是延誤多久（How long）。' },
    { q: 'Have you finished the sales report?', o: ["I'll have it done by noon.", 'Sales went up last month.', 'He reported to the manager.'], ex: '問做完了沒，回答「中午前會完成」等於還沒。另外兩個選項只是重複 sales / report 的發音。' },
    { q: 'How do I get to the train station?', o: ['Take the number five bus.', 'About twenty dollars.', 'The train was crowded.'], ex: 'How do I get to… 問交通方式；About twenty dollars 回答的是價錢。' },
    { q: 'Could you help me move this desk?', o: ['Sure, just give me a minute.', "It's a wooden desk.", 'I moved here last year.'], ex: 'Could you…? 是請求，回答 Sure 表示願意幫忙。' },
    { q: "The printer on this floor isn't working.", o: ["I'll call the technician.", 'Twenty copies, please.', 'On the third floor.'], ex: '對方陳述一個問題，合理的回應是提出解決辦法。' },
    { q: 'When will the new manager start?', o: ['The first of next month.', "She's from the Tokyo office.", 'In the marketing department.'], ex: 'When 問時間；另外兩個選項回答的是來歷與部門。' },
    { q: 'Whose laptop is this?', o: ["I think it's Kevin's.", "It's a new model.", 'On the table.'], ex: 'Whose 問「誰的」，回答所有格 Kevin\'s。' },
    { q: "Didn't you attend the workshop yesterday?", o: ['No, I had a client meeting.', "It's in the workshop.", 'Yes, tomorrow morning.'], ex: '否定問句照事實回答：沒參加就說 No，並補充原因。tomorrow morning 是未來，與 yesterday 不合。' },
    { q: 'How much does the monthly membership cost?', o: ['Forty dollars.', 'Every month.', 'At the front desk.'], ex: 'How much 問價錢。' },
    { q: 'Shall we take a taxi to the restaurant?', o: ["It's close enough to walk.", 'A table for four.', 'The food was excellent.'], ex: '對提議的間接回答：很近，走路就好（＝不用搭計程車）。' },
    { q: 'Which supplier did we choose?', o: ['The one with the lowest price.', 'Yes, we chose it.', 'By express delivery.'], ex: 'Which 問哪一個，常用 The one… 回答；疑問詞問句不能用 Yes 回答。' },
    { q: "You've met our new accountant, haven't you?", o: ['Yes, we were introduced on Monday.', 'The account is closed.', "No, I can't count them."], ex: '附加問句照事實回答 Yes / No。另外兩個選項用 account / count 混淆 accountant。' },
    { q: 'How long will the renovation take?', o: ['About three weeks.', 'A new carpet.', 'Since last Tuesday.'], ex: 'How long 問需要多久，回答一段時間。Since… 用於已經開始的事。' },
    { q: 'Can I pay by credit card?', o: ['Sorry, we only accept cash.', 'The total is fifty dollars.', "Here's your receipt."], ex: '問能不能刷卡，回答「抱歉只收現金」。' },
    { q: "Why don't we postpone the meeting until Friday?", o: ['That works for me.', 'Because it was long.', 'In the main office.'], ex: 'Why don\'t we…? 是提議不是問原因，回答 That works for me（我可以）。' },
    { q: 'Where can I find the user manual?', o: ["It's available on our Web site.", 'Manually, I think.', 'Yes, I found it useful.'], ex: 'Where 問哪裡找得到，回答「在網站上」。' },
    { q: 'Do you want me to send the invoice today or tomorrow?', o: ['Today, if possible.', 'Yes, please do.', 'It was sent by mail.'], ex: '二選一問句，要明確選 today 或 tomorrow。' },
    { q: "Who's going to pick up the clients from the airport?", o: ['Carlos offered to do it.', 'Their flight lands at six.', 'At the arrivals hall.'], ex: 'Who 問誰去接，回答 Carlos 自願去。' },
    { q: 'This report needs to be proofread before it goes out.', o: ['I can take a look at it after lunch.', 'It went out last week.', 'The proof is on the desk.'], ex: '對方說報告需要校對，合理回應是主動說可以幫忙看。' },
    { q: 'How often do you back up your files?', o: ['Once a week.', 'In the back office.', 'Four files.'], ex: 'How often 問頻率，回答 Once a week。' },
    { q: 'Is the conference room available this afternoon?', o: ['Let me check the schedule.', "It's a large room.", 'The conference was interesting.'], ex: '不確定時的間接回答：我查一下時間表。' },
  ],
  part3: [
    {
      lines: [
        ['W', 'Hello, this is Jenna Park. I have a dinner reservation for six people tomorrow at seven, but two more colleagues will be joining us.'],
        ['M', "Let me see. We can seat eight, but only in the private room at the back. There's no extra charge."],
        ['W', "That's perfect. Actually, it's a farewell dinner for our manager, so a quiet room would be nice."],
        ['M', "Wonderful. Would you like us to prepare a cake? We just need one day's notice."],
        ['W', 'Yes, please. A small chocolate one would be great.'],
      ],
      qs: [
        { q: 'Why is the woman calling?', o: ['To change a reservation', 'To cancel a dinner', 'To ask about the menu', 'To complain about a bill'], ex: '她原本訂六位，現在多兩位同事，要更改訂位人數。' },
        { q: 'What kind of event is the woman planning?', o: ['A farewell dinner', 'A birthday party', 'A client meeting', 'A wedding reception'], ex: "it's a farewell dinner for our manager：主管的歡送晚餐。" },
        { q: 'What does the man offer to do?', o: ['Prepare a cake', 'Give a discount', 'Decorate the room', 'Send a menu'], ex: 'Would you like us to prepare a cake?' },
      ],
    },
    {
      lines: [
        ['M', "Hi, Rita. My computer won't connect to the shared printer. Is anyone else having trouble?"],
        ['W', 'Yes, the whole third floor. The IT team is replacing the network router this morning.'],
        ['M', "Oh, I see. I need to print contracts for a two o'clock meeting."],
        ['W', 'You could e-mail the files to me. My office is on the fifth floor, and our printer is working fine.'],
        ['M', "Thanks, I'll send them right now."],
      ],
      qs: [
        { q: "What is the man's problem?", o: ['He cannot print.', 'He lost some contracts.', 'He is late for a meeting.', 'He forgot his password.'], ex: '他的電腦連不上共用印表機。' },
        { q: 'According to the woman, what is causing the problem?', o: ['Some equipment is being replaced.', 'The printer is out of paper.', 'The power is off.', 'The office is moving.'], ex: 'IT 部門今天早上在更換網路路由器。' },
        { q: 'What will the man most likely do next?', o: ['Send some files', 'Call the IT team', 'Go to the third floor', 'Postpone the meeting'], ex: "I'll send them right now：把檔案寄給她列印。" },
      ],
    },
    {
      lines: [
        ['W', "Welcome to Dalton Logistics, Mr. Evans. I'm Priya from Human Resources."],
        ['M', "Thank you. I'm excited to start. Where should I go first?"],
        ['W', "First, we'll get your employee ID card at the security office. Then I'll show you around the warehouse."],
        ['M', 'Great. Will I meet my team today?'],
        ['W', 'Yes, your supervisor, Ms. Holt, has arranged a team lunch at noon in the cafeteria.'],
      ],
      qs: [
        { q: 'Who most likely is the man?', o: ['A new employee', 'A security guard', 'A delivery driver', 'A client'], ex: '人資歡迎他、帶他領員工證並介紹環境，可知是新進員工。' },
        { q: 'What will the speakers do first?', o: ['Get an ID card', 'Tour the warehouse', 'Have lunch', 'Meet the supervisor'], ex: "First, we'll get your employee ID card。參觀倉庫是之後的事。" },
        { q: 'What will take place at noon?', o: ['A team lunch', 'A safety training', 'A job interview', 'A warehouse inspection'], ex: 'Ms. Holt 安排中午在員工餐廳聚餐。' },
      ],
    },
    {
      lines: [
        ['M', "Excuse me, I bought this jacket here last week, but it's too small. Can I exchange it for a larger size?"],
        ['W', 'Of course. Do you have your receipt?'],
        ['M', 'Yes, here it is.'],
        ['W', "Thank you. Hmm, I'm afraid the large size is sold out in blue. We have it in gray, or I can order a blue one. It would arrive in three days."],
        ['M', "I'd rather wait for the blue one."],
        ['W', "No problem. I'll just need your phone number so we can contact you."],
      ],
      qs: [
        { q: 'Why does the man want to exchange the jacket?', o: ['It is the wrong size.', 'It is damaged.', 'It is the wrong color.', 'It was too expensive.'], ex: "it's too small：尺寸太小。" },
        { q: 'What problem does the woman mention?', o: ['An item is out of stock.', 'A receipt is missing.', 'The store is closing soon.', 'A price has changed.'], ex: '藍色的大號賣完了（sold out）。' },
        { q: 'What does the woman ask the man for?', o: ['A phone number', 'A credit card', 'An e-mail address', 'A membership card'], ex: "I'll just need your phone number。" },
      ],
    },
    {
      lines: [
        ['W', 'Tom, have you booked your hotel for the Chicago trade fair yet?'],
        ['M', 'Not yet. The hotels near the convention center are all over three hundred dollars a night.'],
        ['W', "I'm staying at the Lakeside Inn. It's a bit farther, but it's half the price, and there's a free shuttle to the convention center."],
        ['M', 'That sounds reasonable. Do you have the link to their Web site?'],
        ['W', "I'll forward you my booking confirmation. It has all the details."],
      ],
      qs: [
        { q: 'What are the speakers preparing for?', o: ['A trade fair', 'A vacation', 'A job interview', 'A company party'], ex: '兩人在討論芝加哥商展的住宿。' },
        { q: "Why hasn't the man booked a hotel?", o: ['The prices are high.', 'The hotels are full.', 'He lost the Web site link.', 'His trip was canceled.'], ex: '會場附近的飯店一晚都超過三百美元。' },
        { q: 'What will the woman send to the man?', o: ['A booking confirmation', 'A shuttle schedule', 'A map of the city', 'A discount coupon'], ex: "I'll forward you my booking confirmation。" },
      ],
    },
    {
      lines: [
        ['M', 'Did you see the results of the customer survey?'],
        ['W', 'I did. Most people like our new app, but many complained that the checkout page is confusing.'],
        ['M', "That's what I noticed, too. Should we ask the design team to simplify it?"],
        ['W', "Yes, but they're busy until the end of the month. Let's bring it up at Thursday's meeting and see if it can be given priority."],
        ['M', "Good idea. I'll prepare a short summary of the survey comments."],
      ],
      qs: [
        { q: 'What are the speakers discussing?', o: ['Survey results', 'A new employee', 'A sales target', 'An advertising budget'], ex: '開頭就問 the results of the customer survey。' },
        { q: 'What did many customers complain about?', o: ['A confusing page', 'Slow delivery', 'High prices', 'Rude staff'], ex: 'the checkout page is confusing：結帳頁面不好懂。' },
        { q: 'What does the man say he will prepare?', o: ['A summary', 'A new design', 'A price list', 'A meeting room'], ex: "I'll prepare a short summary of the survey comments。" },
      ],
    },
    {
      lines: [
        ['W', 'Good morning, Brightside Dental. How can I help you?'],
        ['M', 'Hi, I have an appointment with Dr. Shah on Wednesday at three, but I have to go out of town for work. Could I move it to the following week?'],
        ['W', 'Let me check. Dr. Shah is free on Tuesday the twelfth at ten A.M. or Thursday the fourteenth at four P.M.'],
        ['M', 'Thursday afternoon would be better for me.'],
        ['W', "All right, you're booked. We'll send you a reminder by text message the day before."],
      ],
      qs: [
        { q: 'Where does the woman most likely work?', o: ['At a dental clinic', 'At a travel agency', 'At a law firm', 'At a hotel'], ex: '她接電話說 Brightside Dental。' },
        { q: 'Why does the man need to reschedule?', o: ['He has a business trip.', 'He is feeling sick.', 'He forgot the appointment.', 'His car broke down.'], ex: 'I have to go out of town for work：要出差。' },
        { q: 'What will the clinic send the man?', o: ['A text reminder', 'A bill', 'A form to fill out', 'A map'], ex: "We'll send you a reminder by text message the day before。" },
      ],
    },
    {
      lines: [
        ['M', "Hi, Laura. How are the preparations for Friday's product launch going?"],
        ['W', "Pretty well. The invitations went out, and sixty people have confirmed. But the caterer just called. They can't deliver until six, and the event starts at five thirty."],
        ['M', "That's a problem. Could we start with the presentation and serve the food afterward?"],
        ['W', "That could work. I'll revise the program and e-mail it to the guests."],
      ],
      qs: [
        { q: 'What event are the speakers discussing?', o: ['A product launch', 'A staff training', 'A retirement party', 'A press conference'], ex: "Friday's product launch：週五的產品發表會。" },
        { q: 'What problem does the woman mention?', o: ['A delivery will be late.', 'Few guests have replied.', 'The room is too small.', 'The speaker canceled.'], ex: '外燴要六點才能送到，但活動五點半開始。' },
        { q: 'What does the woman say she will do?', o: ['Update a schedule', 'Find another caterer', 'Call the guests', 'Cancel the presentation'], ex: "I'll revise the program：修改流程並寄給來賓。" },
      ],
    },
    {
      lines: [
        ['W', "Thanks for showing me the office space, Mr. Grant. It's bright, and the location is ideal."],
        ['M', "I'm glad you like it. The rent is two thousand dollars a month, including utilities."],
        ['W', "That's within our budget. But we have twelve employees. Is there enough parking?"],
        ['M', 'There are eight spaces behind the building, and a public lot across the street.'],
        ['W', "I see. I'll discuss it with my business partner and call you by Friday."],
      ],
      qs: [
        { q: 'What is the woman interested in doing?', o: ['Renting an office', 'Buying a car', 'Hiring staff', 'Selling a building'], ex: '她來看辦公空間並詢問租金。' },
        { q: 'What is the woman concerned about?', o: ['Parking', 'The rent', 'The location', 'The lighting'], ex: '她有十二名員工，擔心停車位不夠。租金在預算內，地點與採光她都滿意。' },
        { q: 'What will the woman do by Friday?', o: ['Contact the man', 'Sign a contract', 'Pay a deposit', 'Move in'], ex: "I'll discuss it with my business partner and call you by Friday。" },
      ],
    },
    {
      lines: [
        ['M', 'Angela, are you going to the training session on the new accounting software?'],
        ['W', "I'd like to, but it's at the same time as my call with the auditors."],
        ['M', "They're recording it, so you can watch it later. But there's also a second session next Tuesday."],
        ['W', "Oh, I'd prefer to attend in person so I can ask questions. How do I sign up for Tuesday?"],
        ['M', 'Just reply to the e-mail that Mr. Cho sent this morning.'],
      ],
      qs: [
        { q: 'What is the training session about?', o: ['Accounting software', 'Customer service', 'Workplace safety', 'Public speaking'], ex: 'the training session on the new accounting software。' },
        { q: "Why can't the woman attend the first session?", o: ['She has a scheduling conflict.', 'She is on vacation.', 'She did not receive an invitation.', 'The session is full.'], ex: '時間和她與稽核人員的電話會議撞期。' },
        { q: 'How can the woman register for the second session?', o: ['By replying to an e-mail', 'By calling Mr. Cho', 'By filling out a form', 'By visiting a Web site'], ex: 'Just reply to the e-mail that Mr. Cho sent this morning。' },
      ],
    },
    {
      lines: [
        ['W', "Hello, I'm calling about the sofa I ordered from your store. It was supposed to be delivered today between nine and noon, but no one has come."],
        ['M', "I'm sorry about that. Could I have your order number?"],
        ['W', "It's four, seven, seven, one, two."],
        ['M', "Thank you. It looks like the truck had engine trouble this morning. We can deliver it tomorrow, and we'll waive the delivery fee."],
        ['W', 'All right. Tomorrow morning is fine.'],
      ],
      qs: [
        { q: 'Why is the woman calling?', o: ['A delivery has not arrived.', 'An item is damaged.', 'She wants to cancel an order.', 'She was charged twice.'], ex: '沙發應該今天上午送到，但沒有人來。' },
        { q: 'What caused the delay?', o: ['A vehicle problem', 'Bad weather', 'A wrong address', 'A staff shortage'], ex: 'the truck had engine trouble：貨車引擎故障。' },
        { q: 'What does the man offer?', o: ['To cancel a fee', 'To give a refund', 'To send a different sofa', 'To deliver it tonight'], ex: "we'll waive the delivery fee：免收運費。" },
      ],
    },
    {
      lines: [
        ['M', "The quarterly figures look good. We're fifteen percent over our sales target."],
        ['W', "That's great news. Does that mean we can finally hire another designer?"],
        ['M', "I think so. I'll raise it with the director at this afternoon's budget meeting."],
        ['W', "If it's approved, I can post the job advertisement this week. I already have a draft."],
        ['M', 'Perfect. Send it to me so I can show it to the director.'],
      ],
      qs: [
        { q: 'What does the man say about sales?', o: ['They exceeded the target.', 'They fell this quarter.', 'They were the same as last year.', 'They have not been calculated.'], ex: "We're fifteen percent over our sales target。" },
        { q: 'What does the woman want to do?', o: ['Hire a new employee', 'Increase the budget', 'Redesign a product', 'Change the sales target'], ex: '她想再招募一位設計師。' },
        { q: 'What does the man ask the woman to send?', o: ['A draft advertisement', 'The sales figures', 'A meeting agenda', 'Her résumé'], ex: 'Send it to me：it 指她已經寫好的徵才廣告草稿。' },
      ],
    },
    {
      lines: [
        ['W', 'Welcome to the National Marketing Conference. May I have your name?'],
        ['M', 'Daniel Ross, from Peak Advertising.'],
        ['W', "Here's your name badge and program, Mr. Ross. The opening speech begins at nine in the main hall."],
        ['M', "Thanks. I signed up for the social media workshop, but I don't see the room listed."],
        ['W', "It's been moved to Room 204 because more people registered than expected."],
        ['M', 'Got it. And where can I leave my coat?'],
        ['W', 'The cloakroom is next to the elevators.'],
      ],
      qs: [
        { q: 'Where most likely are the speakers?', o: ['At a conference', 'At a hotel reception', 'At an airport', 'At a department store'], ex: 'Welcome to the National Marketing Conference。' },
        { q: 'Why was the workshop moved?', o: ['More people signed up than expected.', 'The room was being repaired.', 'The speaker arrived late.', 'The equipment was broken.'], ex: 'because more people registered than expected。' },
        { q: 'What does the man ask about?', o: ['Where to leave his coat', 'Where to have lunch', 'When the workshop ends', 'How to get a refund'], ex: 'where can I leave my coat? → 電梯旁的衣帽間。' },
      ],
    },
  ],
  part4: [
    {
      label: 'Announcement',
      voice: 'W',
      text: "Attention, shoppers. Fresh Mart will be closing in fifteen minutes. Please bring your final purchases to the checkout counters at the front of the store. Don't forget that this week only, all fresh fruit is twenty percent off. We will reopen tomorrow morning at eight. Thank you for shopping at Fresh Mart.",
      qs: [
        { q: 'Where is the announcement being made?', o: ['At a supermarket', 'At a train station', 'At a library', 'At a cinema'], ex: '提到 shoppers、checkout counters、fresh fruit，是超市。' },
        { q: 'What will happen in fifteen minutes?', o: ['The store will close.', 'A sale will begin.', 'A new counter will open.', 'The store will reopen.'], ex: 'Fresh Mart will be closing in fifteen minutes。' },
        { q: 'What is on sale this week?', o: ['Fruit', 'Bread', 'Vegetables', 'Drinks'], ex: 'all fresh fruit is twenty percent off。' },
      ],
    },
    {
      label: 'Telephone message',
      voice: 'W',
      text: "Hello, Mr. Tanaka. This is Carol from Swift Auto Repair. I'm calling to let you know that your car is ready. We replaced the brake pads and changed the oil, and the total comes to two hundred and ten dollars. We're open until six today and from nine to one on Saturday. If you'd like us to deliver the car to your office, there's a fifteen-dollar charge. Please call us back at 555-0164.",
      qs: [
        { q: 'Where does the speaker work?', o: ['At a car repair shop', 'At a car rental agency', 'At a gas station', 'At a parking garage'], ex: 'This is Carol from Swift Auto Repair。' },
        { q: 'What is the purpose of the message?', o: ['To say that some work is finished', 'To confirm an appointment', 'To offer a discount', 'To ask for payment details'], ex: 'your car is ready：車子修好了。' },
        { q: 'According to the speaker, what costs extra?', o: ['Having the car delivered', 'Changing the oil', 'Picking up on Saturday', 'Replacing the brake pads'], ex: '把車送到辦公室要加收十五美元。' },
      ],
    },
    {
      label: 'Excerpt from a meeting',
      voice: 'M',
      text: "Good morning, everyone. Before we begin, I have some good news. Our company has been chosen to supply uniforms for the city's new sports stadium. It's our biggest contract so far, so we'll need to increase production. Starting next month, we'll add an evening shift at the factory. If you're interested in working evenings, please tell your supervisor by Friday. Evening workers will receive ten percent extra pay.",
      qs: [
        { q: 'What good news does the speaker share?', o: ['The company won a contract.', 'A new factory opened.', 'Sales doubled last month.', 'A manager was promoted.'], ex: '公司被選為新體育場的制服供應商，是目前最大的合約。' },
        { q: 'What will change next month?', o: ['A new shift will be added.', 'The factory will move.', 'Uniforms will be redesigned.', 'Pay will be reduced.'], ex: "we'll add an evening shift at the factory。" },
        { q: 'What should interested listeners do?', o: ['Speak to their supervisor', 'Send an e-mail', 'Sign a list at the door', 'Attend a training session'], ex: 'please tell your supervisor by Friday。' },
      ],
    },
    {
      label: 'Radio broadcast',
      voice: 'M',
      text: "This is Radio 98 with your morning traffic report. Highway 12 is moving slowly because of roadwork near the Lincoln Bridge, so expect delays of up to thirty minutes. Drivers heading downtown should take Route 5 instead. And if you're going to tonight's concert at City Park, remember that parking is limited. We recommend taking the subway. Stay tuned for the weather forecast, coming up next.",
      qs: [
        { q: 'What is causing delays on Highway 12?', o: ['Road construction', 'A car accident', 'Heavy rain', 'A closed bridge'], ex: 'because of roadwork near the Lincoln Bridge：道路施工。' },
        { q: 'What are concertgoers advised to do?', o: ['Use public transportation', 'Arrive early', 'Take Route 5', 'Buy tickets online'], ex: '停車位有限，建議搭地鐵。Route 5 是給要進市區的駕駛的建議。' },
        { q: 'What will listeners hear next?', o: ['A weather report', 'A music program', 'A news interview', 'An advertisement'], ex: 'Stay tuned for the weather forecast, coming up next。' },
      ],
    },
    {
      label: 'Tour information',
      voice: 'W',
      text: "Welcome to the Harlan Chocolate Factory. My name is Mia, and I'll be your guide today. Our tour will last about forty-five minutes. We'll start in the roasting room, then see how the chocolate is mixed and shaped. For safety reasons, please do not touch any of the machines, and photography is not allowed inside. At the end of the tour, you'll be able to taste some samples in our gift shop. Now, please put on these hair caps and follow me.",
      qs: [
        { q: 'Where is the talk taking place?', o: ['At a factory', 'At a museum', 'At a restaurant', 'At a cooking school'], ex: 'Welcome to the Harlan Chocolate Factory。' },
        { q: 'What are listeners told not to do?', o: ['Take pictures', 'Wear hair caps', 'Ask questions', 'Visit the gift shop'], ex: 'photography is not allowed inside；另外也不能碰機器。' },
        { q: 'What will listeners do at the end of the tour?', o: ['Try some products', 'Watch a video', 'Meet the owner', 'Fill out a survey'], ex: "you'll be able to taste some samples in our gift shop。" },
      ],
    },
    {
      label: 'Introduction',
      voice: 'M',
      text: "Thank you all for coming to this month's business lunch. I'm delighted to introduce today's speaker, Dr. Helen Park. Dr. Park taught economics at Weston University for twenty years before starting her own consulting firm. Her latest book, Small Steps, explains how small companies can grow without taking on debt. After her talk, she will answer your questions, and copies of her book will be on sale at the back of the room. Please join me in welcoming Dr. Park.",
      qs: [
        { q: 'Who is Dr. Park?', o: ['A business consultant', 'A bank manager', 'A university student', 'A bookstore owner'], ex: '她教了二十年經濟學後，開了自己的顧問公司。' },
        { q: "What is Dr. Park's book about?", o: ['How small companies can grow', 'How to teach economics', 'How to borrow money', 'How to write a business plan'], ex: '書中說明小公司如何在不舉債的情況下成長。' },
        { q: 'What can listeners do after the talk?', o: ['Buy a book', 'Have lunch', 'Join a workshop', 'Register for a course'], ex: 'copies of her book will be on sale at the back of the room。' },
      ],
    },
    {
      label: 'Announcement',
      voice: 'W',
      text: 'Attention passengers on Pacific Air flight 286 to Vancouver. Due to a late-arriving aircraft, this flight will now depart at four forty-five instead of three thirty. The departure gate has also changed from Gate 14 to Gate 22. We apologize for the inconvenience. Passengers may collect a free drink voucher at the service desk next to Gate 22. Please have your boarding pass ready.',
      qs: [
        { q: 'Why is the flight delayed?', o: ['A plane arrived late.', 'The weather is bad.', 'A crew member is sick.', 'There is a mechanical problem.'], ex: 'Due to a late-arriving aircraft：前一班飛機晚到。' },
        { q: 'What else has changed?', o: ['The gate', 'The destination', 'The airline', 'The seat numbers'], ex: '登機門從 14 號改到 22 號。' },
        { q: 'What can passengers receive at the service desk?', o: ['A drink voucher', 'A new boarding pass', 'A meal', 'A refund'], ex: 'Passengers may collect a free drink voucher。' },
      ],
    },
    {
      label: 'Advertisement',
      voice: 'M',
      text: 'Is your office a mess? Let Spotless Cleaning Services take care of it! We clean offices of all sizes, in the evening or on weekends, so your work is never interrupted. Our staff are fully trained, and we use only environmentally friendly products. Sign a one-year contract this month and get your first two weeks free. Call 555-0199 today for a free quote.',
      qs: [
        { q: 'What is being advertised?', o: ['A cleaning service', 'An office furniture store', 'A moving company', 'A staffing agency'], ex: 'Spotless Cleaning Services 提供辦公室清潔。' },
        { q: "What does the speaker say about the company's products?", o: ['They are environmentally friendly.', 'They are made locally.', 'They are inexpensive.', 'They are sold online.'], ex: 'we use only environmentally friendly products。' },
        { q: 'How can listeners get two weeks of free service?', o: ['By signing a one-year contract', 'By calling before noon', 'By recommending a friend', 'By paying in advance'], ex: 'Sign a one-year contract this month and get your first two weeks free。' },
      ],
    },
    {
      label: 'Talk',
      voice: 'W',
      text: "Okay, team, listen up. Tomorrow we're doing the annual inventory count, so the store will be closed to customers. Please arrive by seven A.M. You'll work in pairs. One person counts the items, and the other enters the numbers on a tablet. I've posted the list of pairs by the staff room door. Breakfast will be provided, and we expect to finish by three. If you can't come, let me know before you leave today.",
      qs: [
        { q: 'What will happen tomorrow?', o: ['An inventory count', 'A store opening', 'A sales event', 'A staff party'], ex: "Tomorrow we're doing the annual inventory count：年度盤點。" },
        { q: 'What has the speaker posted?', o: ['A list of work partners', 'A breakfast menu', 'A map of the store', 'A sales report'], ex: "I've posted the list of pairs by the staff room door。" },
        { q: 'What should listeners do if they cannot come?', o: ['Tell the speaker today', 'Call the store tomorrow', 'Find a replacement', 'Send an e-mail tonight'], ex: 'let me know before you leave today。' },
      ],
    },
    {
      label: 'Recorded message',
      voice: 'M',
      text: 'Thank you for calling Greenfield Public Library. Our opening hours are Monday to Friday, nine A.M. to eight P.M., and Saturday, ten to five. We are closed on Sundays. To renew a book, press one. To ask about events, press two. Please note that the second-floor reading room is closed this month while new lighting is installed. To speak with a librarian, please stay on the line.',
      qs: [
        { q: 'What type of organization is the message for?', o: ['A library', 'A bookstore', 'A school', 'A community center'], ex: 'Thank you for calling Greenfield Public Library。' },
        { q: 'Why is the reading room closed?', o: ['Lights are being installed.', 'It is being painted.', 'It is a public holiday.', 'There is a private event.'], ex: 'while new lighting is installed：正在安裝新的照明。' },
        { q: 'How can callers speak to a staff member?', o: ['By staying on the line', 'By pressing one', 'By pressing two', 'By calling back on Monday'], ex: 'To speak with a librarian, please stay on the line。' },
      ],
    },
  ],
}
