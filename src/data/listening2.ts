import type { RawListening } from './listening'

// 原創模擬題，比照多益聽力 Part 2–4。選項第一個是正確答案，載入時會打散；解析不可用 (A)(B) 指稱選項。
export const LISTENING_2: RawListening = {
  id: 'l2',
  name: '聽力試題 2',
  part2: [
    { q: "Where's the nearest post office?", o: ['Two blocks down on the left.', 'By express mail.', 'At nine in the morning.'], ex: 'Where 問地點；「快遞寄送」和「早上九點」分別回答方式與時間。' },
    { q: 'When is the report due?', o: ['By the end of the week.', 'To the finance team.', "It's about sales."], ex: 'When 問期限，回答 By the end of the week。' },
    { q: "Who's leading the training session?", o: ['Someone from the IT department.', 'In Room 3.', 'It lasts two hours.'], ex: 'Who 問人，回答「IT 部門的人」。' },
    { q: 'Why is the office so quiet today?', o: ['Most people are at the conference.', "Yes, it's very quiet.", "I'll turn it down."], ex: 'Why 問原因：大多數人去參加會議了。疑問詞問句不能用 Yes 回答。' },
    { q: 'How many people are coming to the dinner?', o: ['About fifteen, I think.', 'At the Italian restaurant.', 'It was delicious.'], ex: 'How many 問人數。' },
    { q: 'Should I print the agenda or send it by e-mail?', o: ['E-mail is fine.', 'Yes, you should.', 'On the printer.'], ex: '二選一問句，要選其中一個方式。' },
    { q: "Haven't you met Mr. Diaz before?", o: ["Yes, at last year's trade show.", 'He meets clients daily.', "No, it's not his."], ex: '否定問句照事實回答：見過就說 Yes，並補充在哪裡見過。' },
    { q: 'Could you lend me your stapler?', o: ['Sure, here you go.', "I'll lend you some money.", "It's on sale."], ex: '借東西的請求，回答 Sure, here you go。' },
    { q: 'The elevator is out of order again.', o: ["Let's take the stairs.", 'In alphabetical order.', 'On the fifth floor.'], ex: '電梯又壞了 → 合理回應是「那走樓梯吧」。order 是重複發音的陷阱。' },
    { q: 'What time does the bank close today?', o: ['At four thirty.', "It's near the station.", 'For a new account.'], ex: 'What time 問幾點。' },
    { q: 'Which projector should I use?', o: ['The one in the cabinet works best.', 'Yes, use it.', 'Project managers.'], ex: 'Which 問哪一個，用 The one… 回答。' },
    { q: 'Would you like to join us for lunch?', o: ["I'd love to, but I have a deadline.", 'I already joined.', 'A sandwich and a salad.'], ex: '婉拒邀約的常見說法：I\'d love to, but…' },
    { q: 'How long have you worked here?', o: ['Almost five years.', 'Very hard.', "It's a long way."], ex: 'How long 問多久，回答一段時間。' },
    { q: "Isn't the client meeting at two?", o: ['No, it was moved to three.', 'Two copies, please.', "She's a new client."], ex: '否定問句，照事實回答並更正時間。' },
    { q: 'Can you show me how to use this machine?', o: ['Of course. First, press the green button.', "It's a new machine.", "I'll show up later."], ex: '請對方示範，回答 Of course 並開始說明步驟。' },
    { q: "Why don't you take a break?", o: ['Thanks, I think I will.', "Because it's broken.", 'It was a short trip.'], ex: "Why don't you…? 是建議，不是問原因。" },
    { q: 'Has the shipment from Korea arrived?', o: ["It's expected tomorrow.", 'Yes, I shipped it.', 'By airplane, I think.'], ex: '問到了沒，回答「預計明天到」＝還沒到。' },
    { q: 'Who should I contact about my paycheck?', o: ['Talk to someone in payroll.', 'It was paid yesterday.', 'Check the box.'], ex: 'Who 問該找誰：找薪資部門。' },
    { q: 'Do you know where the spare keys are?', o: ['Ms. Chen keeps them in her desk.', "Yes, they're spare.", 'The key to success.'], ex: '間接問句問地點，回答鑰匙放在哪裡。' },
    { q: 'We need to order more paper for the copier.', o: ["I'll call the supplier this afternoon.", "It's a copy.", 'Twenty pages.'], ex: '對方指出需求，合理回應是主動處理。' },
    { q: 'How was your trip to Berlin?', o: ['Very productive, thank you.', 'By train.', 'Next Monday.'], ex: 'How was… 問感想，不是問交通方式。' },
    { q: 'When can you start the new project?', o: ['As soon as I finish this one.', "It's a big project.", 'Yes, I can.'], ex: 'When 問時間：手上這個做完就開始。' },
    { q: 'Are these seats taken?', o: ['No, please go ahead.', 'Take two.', "They're very comfortable."], ex: '問座位有沒有人，回答「沒有，請坐」。' },
    { q: "Whose turn is it to clean the kitchen?", o: ["I think it's Ben's.", 'Turn left at the corner.', "It's a clean kitchen."], ex: 'Whose turn 問輪到誰，回答 Ben\'s。' },
    { q: 'This software is difficult to use.', o: ["There's a tutorial on the company Web site.", "It's soft.", 'Use it every day.'], ex: '對方抱怨難用，合理回應是提供解決辦法。' },
  ],
  part3: [
    {
      lines: [
        ['W', "Hi, I reserved a compact car under the name Laura Simmons. I'm picking it up today."],
        ['M', "Welcome, Ms. Simmons. Actually, we've run out of compact cars, so I can give you a mid-size car at no extra charge."],
        ['W', 'That works. Does it come with a navigation system? I am not familiar with the area.'],
        ['M', "It doesn't, but you can rent a GPS unit for five dollars a day. I can add it to your contract now."],
        ['W', 'Yes, please do that.'],
      ],
      qs: [
        { q: 'Where most likely are the speakers?', o: ['At a car rental counter', 'At a hotel reception desk', 'At a repair shop', 'At a travel agency'], ex: '她來取預約的車，男子提供升級車款。' },
        { q: 'What does the man offer the woman?', o: ['A larger car for the same price', 'A discount on her next rental', 'A free tank of fuel', 'A ride to her hotel'], ex: '小型車沒了，免費給她中型車。' },
        { q: 'What will the man most likely do next?', o: ['Add an item to a contract', 'Show the woman a map', 'Call another branch', 'Wash the car'], ex: '他說可以現在把 GPS 加到合約裡，她說好。' },
      ],
    },
    {
      lines: [
        ['M', "Hello, this is Paul from Rivera Accounting. We received our office supply order this morning, but the ink cartridges are the wrong type."],
        ['W', "I'm sorry about that. Could you read me the model number of your printer?"],
        ['M', "It's an L-four-fifty."],
        ['W', "I see. We sent cartridges for the L-five-fifty. I'll have the correct ones delivered by tomorrow morning. Our driver will pick up the wrong ones at the same time."],
        ['M', 'Great, thank you.'],
      ],
      qs: [
        { q: 'Why is the man calling?', o: ['He received the wrong items.', 'His order has not arrived.', 'He wants to buy a printer.', 'He was charged twice.'], ex: '墨水匣型號不對。' },
        { q: 'What does the woman ask for?', o: ['A model number', 'An order number', 'A delivery address', 'A credit card number'], ex: 'Could you read me the model number of your printer?' },
        { q: 'What will happen tomorrow morning?', o: ['Correct items will be delivered.', 'A technician will visit.', 'The man will return to the store.', 'A refund will be issued.'], ex: '明早送來正確的墨水匣，同時收回送錯的。' },
      ],
    },
    {
      lines: [
        ['W', "Hello, Mr. Patel? This is Grace Lin from Horizon Media. We'd like to invite you to a second interview for the graphic designer position."],
        ['M', "That's great news. When would it be?"],
        ['W', 'We have openings on Thursday at ten or Friday at two. It will be a video interview with our creative director.'],
        ['M', "Friday at two works best for me. Should I prepare anything?"],
        ['W', 'Yes, please be ready to share your screen and walk us through two or three projects from your portfolio.'],
      ],
      qs: [
        { q: 'Why is the woman calling?', o: ['To schedule an interview', 'To offer the man a job', 'To cancel a meeting', 'To ask for a reference'], ex: '邀請他參加第二次面試。' },
        { q: 'How will the interview be conducted?', o: ['By video', 'In person', 'By telephone', 'In writing'], ex: 'It will be a video interview。' },
        { q: 'What is the man asked to do?', o: ['Present some of his work', 'Bring a printed résumé', 'Complete a test', 'Send references'], ex: '準備分享螢幕，介紹作品集裡的兩三個作品。' },
      ],
    },
    {
      lines: [
        ['M', 'Have you tried the new menu in the cafeteria yet?'],
        ['W', 'I had the grilled chicken salad yesterday. It was good, but prices have gone up quite a bit.'],
        ['M', "I noticed that. A sandwich is now eight dollars. I'm thinking about bringing my lunch from home."],
        ['W', 'Me too. Actually, the break room on our floor just got a new microwave, so it would be easy to heat up food.'],
      ],
      qs: [
        { q: 'What are the speakers discussing?', o: ['A cafeteria menu', 'A cooking class', 'A restaurant opening', 'A company party'], ex: '員工餐廳的新菜單。' },
        { q: 'What does the woman say about the cafeteria?', o: ['Its prices have increased.', 'Its food is not fresh.', 'It closes too early.', 'It is too crowded.'], ex: 'prices have gone up quite a bit。' },
        { q: 'According to the woman, what was recently added to the break room?', o: ['A microwave', 'A refrigerator', 'A coffee machine', 'A vending machine'], ex: 'the break room on our floor just got a new microwave。' },
      ],
    },
    {
      lines: [
        ['W', "Hi, I'd like to renew these two books, but the library's Web site isn't working."],
        ['M', "Yes, the online system is down for maintenance today. I can renew them for you here."],
        ['W', 'Thank you. Can I keep them for another three weeks?'],
        ['M', "One of them, yes. But the other book has been requested by another member, so it's due back on Friday."],
        ['W', "Oh, that's fine. I'll finish it by then."],
      ],
      qs: [
        { q: 'What does the woman want to do?', o: ['Renew some books', 'Get a library card', 'Reserve a study room', 'Pay a late fee'], ex: "I'd like to renew these two books。" },
        { q: 'What problem does the woman mention?', o: ['A Web site is not working.', 'A book is damaged.', 'She lost her library card.', 'The library is closing early.'], ex: "the library's Web site isn't working。" },
        { q: 'Why can one book not be kept for three weeks?', o: ['Someone else has requested it.', 'It is a reference book.', 'It is overdue.', 'It belongs to another library.'], ex: '另一本已經有其他會員預約，週五要還。' },
      ],
    },
    {
      lines: [
        ['M', "We've hired six new people this year, and our office is getting too crowded. I think it's time to look for a bigger space."],
        ['W', "I agree. I saw a listing for an office in the Parkview Building. It has room for thirty desks and a large meeting room."],
        ['M', "That sounds ideal. But what about the rent? We can't spend more than five thousand dollars a month."],
        ['W', "It's forty-eight hundred, so it's within our budget. I'll call the agent to arrange a visit this week."],
      ],
      qs: [
        { q: 'Why are the speakers looking for a new office?', o: ['Their current office is too small.', 'Their lease is ending.', 'They want a better location.', 'Their rent has increased.'], ex: '今年新聘六人，辦公室太擠了。' },
        { q: 'What is the man concerned about?', o: ['The cost', 'The location', 'The size of the meeting room', 'The move date'], ex: '他問租金，月預算不能超過五千美元。' },
        { q: 'What will the woman do?', o: ['Contact an agent', 'Sign a lease', 'Hire more staff', 'Order new furniture'], ex: "I'll call the agent to arrange a visit this week。" },
      ],
    },
    {
      lines: [
        ['W', "Brian, I just got an e-mail from Dr. Hughes. She can't give the keynote speech at our conference next month. She has a family emergency."],
        ['M', "Oh no. The programs have already been printed with her name on them."],
        ['W', "I know. We'll have to print an insert. But first we need a replacement. What about Professor Adams? She spoke at last year's event and got great feedback."],
        ['M', "Good idea. I'll call her this afternoon and see if she's available."],
      ],
      qs: [
        { q: 'What problem do the speakers discuss?', o: ['A speaker has canceled.', 'A venue is unavailable.', 'A program contains errors.', 'Registration numbers are low.'], ex: 'Dr. Hughes 無法來發表主題演講。' },
        { q: 'What does the woman say about Professor Adams?', o: ['She was popular at a previous event.', 'She works with Dr. Hughes.', 'She is not available next month.', 'She helped print the programs.'], ex: '去年演講評價很好。' },
        { q: 'What will the man do this afternoon?', o: ['Make a phone call', 'Print new programs', 'Send an e-mail to Dr. Hughes', 'Visit the conference venue'], ex: "I'll call her this afternoon。" },
      ],
    },
    {
      lines: [
        ['M', "Good afternoon. I have a reservation under Kim. I know check-in isn't until three, but is my room ready?"],
        ['W', "I'm sorry, Mr. Kim. Your room is still being cleaned. It should be ready in about an hour."],
        ['M', 'I see. Could I leave my suitcase here in the meantime?'],
        ['W', "Of course. I'll store it behind the desk. And here's a voucher for a free drink at our lobby café while you wait."],
      ],
      qs: [
        { q: 'Where does the woman most likely work?', o: ['At a hotel', 'At an airport', 'At a restaurant', 'At a train station'], ex: '訂房、入住、房間清潔，都是飯店情境。' },
        { q: 'What does the man ask to do?', o: ['Leave his luggage', 'Change his room', 'Check out late', 'Use the business center'], ex: 'Could I leave my suitcase here in the meantime?' },
        { q: 'What does the woman give the man?', o: ['A drink voucher', 'A room key', 'A city map', 'A discount card'], ex: "here's a voucher for a free drink。" },
      ],
    },
    {
      lines: [
        ['W', 'Welcome to the team, Daniel. I hope your first morning has been good so far.'],
        ['M', "It has, thanks. Everyone's been very helpful. But I still can't log in to my laptop."],
        ['W', "That's because your account isn't active yet. The IT department usually sets it up by noon on the first day."],
        ['M', 'Okay. What should I do until then?'],
        ['W', 'You could read the employee handbook. There is a printed copy on your desk.'],
      ],
      qs: [
        { q: 'Who most likely is the man?', o: ['A new employee', 'An IT technician', 'A job applicant', 'A client'], ex: '女子說 Welcome to the team，又問他第一個早上如何。' },
        { q: 'What problem does the man have?', o: ['He cannot access his computer.', 'He cannot find his desk.', 'He missed a meeting.', 'He lost his handbook.'], ex: "I still can't log in to my laptop。" },
        { q: 'What does the woman suggest the man do?', o: ['Read a handbook', 'Call the IT department', 'Use a different laptop', 'Go to lunch early'], ex: '帳號開通前可以先看員工手冊。' },
      ],
    },
    {
      lines: [
        ['M', "Hi, I'm here to pick up a prescription for Thomas Wright."],
        ['W', "Let me check. I'm sorry, Mr. Wright. We're waiting for one of the medicines to be delivered. It should be here tomorrow morning."],
        ['M', "Hmm, I'm leaving for a business trip tomorrow at noon."],
        ['W', 'In that case, we can call you as soon as it arrives. We open at eight, so you could pick it up before your trip.'],
      ],
      qs: [
        { q: 'Where most likely are the speakers?', o: ['At a pharmacy', 'At a hospital', 'At a post office', 'At an airport'], ex: '來領處方藥。' },
        { q: 'Why is the prescription not ready?', o: ['A medicine has not been delivered.', 'The doctor has not approved it.', 'The pharmacist is busy.', 'The man is too early.'], ex: '其中一種藥還在等送貨。' },
        { q: 'What does the woman offer to do?', o: ['Call the man when the item arrives', 'Deliver the item to his home', 'Give him a different medicine', 'Mail it to his hotel'], ex: 'we can call you as soon as it arrives。' },
      ],
    },
    {
      lines: [
        ['W', 'The results from our social media campaign are in. Visits to our online store went up thirty percent last month.'],
        ['M', "That's impressive. Which platform brought in the most visitors?"],
        ['W', 'Short video ads, by far. They cost less than our photo ads but got twice as many clicks.'],
        ['M', "Then let's move more of next month's budget to video. Can you put together a proposal for Friday's meeting?"],
      ],
      qs: [
        { q: 'What are the speakers mainly discussing?', o: ['The results of an advertising campaign', 'The design of a Web site', 'The opening of a store', 'The hiring of a photographer'], ex: '討論社群媒體行銷活動的成效。' },
        { q: 'What does the woman say about the video ads?', o: ['They were more effective and cheaper.', 'They were difficult to produce.', 'They were shown only on weekends.', 'They received complaints.'], ex: '成本比圖片廣告低，點擊卻多一倍。' },
        { q: 'What does the man ask the woman to do?', o: ['Prepare a proposal', 'Make a new video', 'Cancel the photo ads', 'Contact a platform'], ex: '請她為週五會議準備提案。' },
      ],
    },
    {
      lines: [
        ['M', "Excuse me. My flight to Chicago was just canceled. Can you help me find another one?"],
        ['W', "Certainly. Let me look. There's a flight at six fifteen this evening, but it only has seats in business class. Or there's one tomorrow at seven A.M. in economy."],
        ['M', "I have a meeting in Chicago tomorrow at nine, so I'd better take tonight's flight. Will I have to pay more?"],
        ['W', 'No. Since your original flight was canceled, the upgrade is free.'],
      ],
      qs: [
        { q: 'What problem does the man have?', o: ['His flight was canceled.', 'He lost his boarding pass.', 'His bag is missing.', 'He arrived at the wrong gate.'], ex: 'My flight to Chicago was just canceled。' },
        { q: 'Why does the man choose the evening flight?', o: ['He has a meeting the next morning.', 'It is less expensive.', 'He prefers business class.', 'The morning flight is full.'], ex: '明早九點在芝加哥開會，搭明早七點的班機來不及。' },
        { q: 'What does the woman say about the upgrade?', o: ['It will not cost extra.', 'It requires a membership.', 'It must be paid in cash.', 'It is not available.'], ex: '原班機被取消，所以升等免費。' },
      ],
    },
    {
      lines: [
        ['W', "Hi, I'm thinking about joining this gym. What kinds of classes do you offer?"],
        ['M', 'We have yoga, spinning, and strength training every day. Most classes are in the early morning or after six P.M.'],
        ['W', 'That fits my work schedule. Is there a trial period?'],
        ['M', "Yes, you can try the gym free for one week. You'll just need to fill out this form and show a photo ID."],
      ],
      qs: [
        { q: 'Where most likely are the speakers?', o: ['At a fitness center', 'At a clinic', 'At a sports store', 'At a community college'], ex: '她考慮加入健身房並詢問課程。' },
        { q: 'What does the woman say about the class times?', o: ['They suit her schedule.', 'They are too early.', 'They change every week.', 'They are fully booked.'], ex: 'That fits my work schedule。' },
        { q: 'What is the woman asked to show?', o: ['Identification', 'A credit card', 'A doctor\'s note', 'A membership card'], ex: '填表並出示附照片的證件。' },
      ],
    },
  ],
  part4: [
    {
      label: 'Telephone message',
      voice: 'M',
      text: "Hi, this is Kevin from Oakwood Furniture calling for Ms. Alvarez. I'm calling about the dining table you ordered. It will be delivered this Thursday between one and five P.M. Please make sure someone is home to sign for it. Also, our team can take away your old table for an extra twenty dollars. If you'd like that service, or if Thursday doesn't work for you, please call me back at 555-0172 by Wednesday.",
      qs: [
        { q: 'What is the purpose of the call?', o: ['To arrange a delivery', 'To confirm a payment', 'To offer a discount', 'To apologize for a delay'], ex: '通知餐桌週四送達的時段。' },
        { q: 'What service does the speaker offer?', o: ['Removing old furniture', 'Assembling the table', 'Delivering on weekends', 'Repairing damage'], ex: '加二十美元可以把舊桌子載走。' },
        { q: 'Why should the listener call back by Wednesday?', o: ['To request an additional service or change the date', 'To pay the remaining balance', 'To choose a table color', 'To confirm her address'], ex: '要加購載走服務、或週四不方便，都要在週三前回電。' },
      ],
    },
    {
      label: 'Announcement',
      voice: 'W',
      text: 'Attention passengers. The ten forty express train to Riverside will now depart from platform six instead of platform two. We repeat, the ten forty express to Riverside will depart from platform six. This change is due to track maintenance. The train is expected to leave on time. Passengers requiring assistance with luggage should speak to a staff member wearing a yellow vest.',
      qs: [
        { q: 'What has changed?', o: ['The departure platform', 'The departure time', 'The destination', 'The ticket price'], ex: '月台從二號改到六號。' },
        { q: 'Why has the change been made?', o: ['Because of track maintenance', 'Because of bad weather', 'Because a train is late', 'Because of a special event'], ex: 'This change is due to track maintenance。' },
        { q: 'Who should passengers speak to for help with luggage?', o: ['A staff member in a yellow vest', 'The train driver', 'The ticket office', 'A security guard'], ex: '穿黃色背心的工作人員。' },
      ],
    },
    {
      label: 'Advertisement',
      voice: 'W',
      text: "Want to speak English with confidence? At Bridge Language School, our small classes of no more than eight students mean you'll get plenty of time to practice. All of our teachers are certified and have at least five years of experience. Classes are offered in the mornings, evenings, and on Saturdays. Sign up before the end of this month and your first lesson is free. Visit our Web site to take a short online test and find the right level for you.",
      qs: [
        { q: 'What is being advertised?', o: ['A language school', 'A travel agency', 'A bookstore', 'A tutoring app'], ex: 'Bridge Language School 的英語課程。' },
        { q: 'What is mentioned about the classes?', o: ['They are small.', 'They are held online.', 'They are taught by students.', 'They last one year.'], ex: '每班不超過八人。' },
        { q: 'What can listeners do on the Web site?', o: ['Take a placement test', 'Watch a free lesson', 'Read student reviews', 'Download a textbook'], ex: '上網做簡短測驗，找出適合的程度。' },
      ],
    },
    {
      label: 'Excerpt from a meeting',
      voice: 'M',
      text: "Before we finish, I'd like to talk about our new expense software. Starting next month, all travel expenses must be submitted through the app instead of on paper. It's quite simple. You just take a photo of each receipt with your phone. I know some of you have questions, so we've scheduled a short training session on Tuesday at ten. Please bring your phone so you can install the app during the session.",
      qs: [
        { q: 'What is the speaker mainly talking about?', o: ['A new software system', 'A change in travel policy', 'A budget reduction', 'A new phone plan'], ex: '新的費用報銷軟體。' },
        { q: 'How will employees submit receipts?', o: ['By taking photos of them', 'By mailing them', 'By scanning them at the office', 'By giving them to a manager'], ex: '用手機把每張收據拍照。' },
        { q: 'What are listeners asked to bring to the training session?', o: ['Their phones', 'Their receipts', 'Their laptops', 'A printed form'], ex: 'Please bring your phone。' },
      ],
    },
    {
      label: 'Tour information',
      voice: 'M',
      text: "Good morning, and welcome to the Westbrook Art Museum. I'm Daniel, and I'll be guiding you through our new exhibition of modern photography. The tour takes about an hour. Please keep your voices down, as other visitors are enjoying the galleries. You're welcome to take pictures, but please don't use the flash. After the tour, you can visit our gift shop, where all items are fifteen percent off for tour participants today.",
      qs: [
        { q: 'What will listeners see on the tour?', o: ['Photographs', 'Sculptures', 'Paintings', 'Historical documents'], ex: 'a new exhibition of modern photography。' },
        { q: 'What are listeners asked not to do?', o: ['Use the flash', 'Take pictures', 'Ask questions', 'Leave the group'], ex: '可以拍照，但不要用閃光燈。' },
        { q: 'What is offered to tour participants?', o: ['A discount at the gift shop', 'A free guidebook', 'A free coffee', 'Free admission next time'], ex: '今天參加導覽的人禮品店打八五折。' },
      ],
    },
    {
      label: 'News report',
      voice: 'W',
      text: "In local news, the new Riverside Park will open to the public this Saturday. The park includes walking trails, a children's playground, and an outdoor stage for concerts. Mayor Linda Choi will attend the opening ceremony at ten A.M. Because parking near the park is limited, the city will run free shuttle buses from the central library every fifteen minutes on Saturday.",
      qs: [
        { q: 'What will happen on Saturday?', o: ['A park will open.', 'A concert will be canceled.', 'A library will close.', 'An election will be held.'], ex: '新的 Riverside Park 週六開放。' },
        { q: 'Who will attend the ceremony?', o: ['The mayor', 'A famous musician', 'A school principal', 'A park designer'], ex: 'Mayor Linda Choi will attend。' },
        { q: 'Why will shuttle buses be provided?', o: ['Parking is limited.', 'Roads will be closed.', 'The park is far from the city.', 'Many children will attend.'], ex: '公園附近停車位有限。' },
      ],
    },
    {
      label: 'Talk',
      voice: 'W',
      text: "Welcome back from the break, everyone. In the first part of this workshop, we talked about why we often waste time at work. Now let's look at some solutions. One of the simplest is to plan your next day before you leave the office. In a moment, I'll ask you to form groups of four and share one habit you'd like to change. Each group will then present its ideas to the rest of the room.",
      qs: [
        { q: 'What is the workshop about?', o: ['Time management', 'Public speaking', 'Customer service', 'Office safety'], ex: '討論為什麼浪費時間以及解決辦法。' },
        { q: 'What does the speaker recommend?', o: ['Planning the next day in advance', 'Taking more breaks', 'Working from home', 'Answering e-mails first'], ex: '下班前先規劃好隔天的工作。' },
        { q: 'What will listeners do next?', o: ['Form small groups', 'Watch a video', 'Take a test', 'Go to lunch'], ex: '分成四人一組分享想改變的習慣。' },
      ],
    },
    {
      label: 'Recorded message',
      voice: 'M',
      text: "Thank you for calling Metro Power. We are aware of a power outage affecting parts of the downtown area. Our crews are working to restore service, and we expect power to return by six P.M. today. You do not need to report this outage. If you are calling about a different problem, please press one. For billing questions, please press two.",
      qs: [
        { q: 'What is the message mainly about?', o: ['A power outage', 'A billing error', 'A new service plan', 'Office hours'], ex: '市中心部分地區停電。' },
        { q: 'When is the problem expected to be fixed?', o: ['By six P.M. today', 'Tomorrow morning', 'Within one hour', 'By the end of the week'], ex: 'we expect power to return by six P.M. today。' },
        { q: 'Why would a caller press two?', o: ['To ask about a bill', 'To report the outage', 'To speak to a technician', 'To hear the message again'], ex: 'For billing questions, please press two。' },
      ],
    },
    {
      label: 'Speech',
      voice: 'M',
      text: "Thank you all for being here tonight to celebrate Margaret Hill's retirement. Margaret joined our company thirty years ago as an assistant in the accounting department, and she retired as our chief financial officer. She also started our mentoring program, which has helped more than two hundred young employees. Margaret, on behalf of everyone here, I'd like to present you with this photo album, filled with messages from your colleagues.",
      qs: [
        { q: 'What is the purpose of the event?', o: ['To celebrate a retirement', 'To welcome a new employee', 'To announce a promotion', 'To launch a program'], ex: "celebrate Margaret Hill's retirement。" },
        { q: 'What did Margaret Hill start at the company?', o: ['A mentoring program', 'A photography club', 'An accounting department', 'A charity fund'], ex: 'She also started our mentoring program。' },
        { q: 'What will Margaret receive?', o: ['A photo album', 'A watch', 'A trip', 'A plaque'], ex: '一本寫滿同事留言的相簿。' },
      ],
    },
    {
      label: 'Announcement',
      voice: 'W',
      text: "Good afternoon, shoppers, and thank you for visiting Brightway Home Store. Have you joined our rewards program yet? Members earn one point for every dollar they spend, and every hundred points can be exchanged for a five-dollar coupon. Joining is free and only takes a minute. Just ask any cashier. Sign up today and you'll receive fifty bonus points right away.",
      qs: [
        { q: 'What is being promoted?', o: ['A rewards program', 'A grand opening sale', 'A new product line', 'A credit card'], ex: '會員集點計畫。' },
        { q: 'How can listeners join?', o: ['By asking a cashier', 'By visiting a Web site', 'By filling out a form at home', 'By calling a number'], ex: 'Just ask any cashier。' },
        { q: 'What will people who sign up today receive?', o: ['Extra points', 'A free gift', 'A five-dollar coupon', 'Free delivery'], ex: "you'll receive fifty bonus points right away。" },
      ],
    },
  ],
}
