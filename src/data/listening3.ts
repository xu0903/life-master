import type { RawListening } from './listening'

// 原創 900 級模擬題：間接回答、言外之意、看圖表、三人對話、計畫變更與換句話說的陷阱。選項第一個是正確答案，載入時會打散。
export const LISTENING_3: RawListening = {
  id: 'l3',
  name: '聽力試題 3',
  level: '900',
  part2: [
    {
      q: "Who's going to lead the training session on Thursday?",
      o: ["Hasn't the schedule been posted yet?", 'In the main training room.', 'About two hours long.'],
      ex: '反問「時間表還沒公布嗎？」暗示答案就在時間表上，是 900 級最常見的間接回答。另外兩個分別回答地點和時間長度。',
    },
    {
      q: "Why don't we move the client dinner to Friday?",
      o: ['Most of the sales team will be traveling then.', 'Because the restaurant was full.', 'Yes, I moved last month.'],
      ex: 'Why don\'t we… 是「提議」，不是問原因，所以 Because 開頭是陷阱。正解用「那天業務都在出差」委婉否決提議。',
    },
    {
      q: "The quarterly figures are due by noon, aren't they?",
      o: ['Ms. Ortiz gave us until the end of the day.', "No, they're not in the figure.", "I'd prefer a quarter past twelve."],
      ex: '附加問句確認期限，正解說主管延到下班前，等於否定。quarter、figure 是重複發音的陷阱。',
    },
    {
      q: 'Where can I find the updated price list?',
      o: ["We're still waiting for approval from headquarters.", 'Prices have gone up again.', "It's been updated twice this year."],
      ex: '問在哪裡，正解說「總公司還沒核准」，也就是新價目表還不存在。另外兩個只是重複 price、updated。',
    },
    {
      q: 'Should I book the conference room or the auditorium for the launch?',
      o: ['How many people have registered so far?', 'Yes, you should.', 'The launch went very well.'],
      ex: '二選一問句，正解用反問「目前多少人報名」表示要看人數決定。選擇疑問句不能用 Yes 回答。',
    },
    {
      q: "I can't seem to log in to the expense system.",
      o: ['IT is running maintenance until three.', 'The expenses were higher than expected.', 'Please keep all of your receipts.'],
      ex: '對方說登不進報帳系統，正解說明原因：資訊部維修到三點。其他選項只和「報帳」主題相關，沒有回應問題。',
    },
    {
      q: 'When will the new interns be starting?',
      o: ['That depends on when their contracts are signed.', 'Mostly from local universities.', 'They started the project early.'],
      ex: '「要看合約什麼時候簽」是不給確切時間的間接回答。started 是重複字陷阱。',
    },
    {
      q: "Haven't you met our new regional director?",
      o: ['Only briefly at the reception.', 'We met our sales target.', 'The directions are on the map.'],
      ex: '否定疑問句照一般疑問句理解：有沒有見過？正解「只在酒會上簡短見過」。met、directions 是發音陷阱。',
    },
    {
      q: 'Would you mind reviewing my presentation slides?',
      o: ["I'm tied up until this afternoon.", 'No, it was a great review.', 'Slide them under the door.'],
      ex: 'tied up 是「忙得走不開」，表示下午才有空看，是間接回應。No 開頭的選項內容對不上，slide 是重複字。',
    },
    {
      q: "How much did the catering cost for last year's banquet?",
      o: ['Accounting would have those records.', 'For about two hundred guests.', 'It was held at the Grand Hotel.'],
      ex: '「會計部有紀錄」表示自己不知道、請對方去問，是典型的轉介型回答。',
    },
    {
      q: 'The shipment from Osaka still hasn\'t arrived.',
      o: ['There was a storm at the port all week.', "I've never been to Osaka.", 'It departs from gate seven.'],
      ex: '直述句抱怨貨還沒到，正解解釋原因：港口整週暴風雨。重複 Osaka 的選項是陷阱。',
    },
    {
      q: 'Do you want to take the train or drive to the trade fair?',
      o: ['Parking near the venue is pretty limited.', "Yes, I'd like that.", "That's a very fair price."],
      ex: '沒有直接選，而是說「會場附近很難停車」，暗示要搭火車。fair 一字多義是陷阱。',
    },
    {
      q: "Isn't Mr. Kwan supposed to be giving the keynote speech?",
      o: ['He came down with the flu yesterday.', 'Yes, he gave me the key.', 'The speech lasted an hour.'],
      ex: 'come down with 是「染上（病）」，說明他為什麼不能演講。key 是 keynote 的發音陷阱。',
    },
    {
      q: 'What did you think of the candidate we interviewed this morning?',
      o: ["I'd like to see her portfolio before I decide.", 'I think it was at ten.', 'In the interview room.'],
      ex: '問看法，正解保留意見，要先看作品集。「I think it was at ten」用 think 混淆，回答的卻是時間。',
    },
    {
      q: "Let's go over the budget proposal before the board meeting.",
      o: ['Is half an hour going to be enough?', 'It went over budget again.', 'On the second floor, I believe.'],
      ex: '提議一起看預算，正解反問「半小時夠嗎」，表示同意並討論細節。went over 是 go over 的陷阱。',
    },
    {
      q: 'Which supplier did we end up choosing?',
      o: ["The decision's been put off until next quarter.", 'Yes, we chose it carefully.', 'At the end of the hallway.'],
      ex: 'put off 是「延後」，還沒決定。Which 開頭不能用 Yes 回答，end 是重複字。',
    },
    {
      q: 'Has the marketing team finalized the logo design?',
      o: ["They're presenting three options tomorrow.", 'The final match is tonight.', 'I designed the office myself.'],
      ex: '「明天要提三個方案」表示還沒定案。final、design 都是重複發音的陷阱。',
    },
    {
      q: "You're coming to Lena's retirement party, aren't you?",
      o: ["I wouldn't miss it.", 'She retired from tennis.', 'The party room is on the left.'],
      ex: 'I wouldn\'t miss it 是「一定會去」的慣用語。retired 是重複字陷阱。',
    },
    {
      q: 'How long will the renovation of the lobby take?',
      o: ["The contractor hasn't given us an estimate.", 'Since last spring.', "It's about thirty meters long."],
      ex: 'How long 問要多久，正解說「承包商還沒估」。Since 回答的是「從什麼時候開始」，meters long 則是 long 的字面陷阱。',
    },
    {
      q: 'I think the projector in Room B is broken again.',
      o: ['Use the one in my office for now.', 'The project is due tomorrow.', 'Yes, she broke the record.'],
      ex: '直述句回報問題，正解提供解決辦法。project、broke 都是發音陷阱。',
    },
    {
      q: 'Why was the product launch pushed back?',
      o: ["Didn't you read Monday's memo?", 'Push the button on the left.', 'To the end of the month.'],
      ex: '反問「你沒看週一的公告嗎」，暗示原因寫在公告裡。To the end of the month 回答的是延到何時，不是原因。',
    },
    {
      q: "Could you send me the minutes from yesterday's meeting?",
      o: ['Sanjay was the one taking notes.', 'It lasted about forty minutes.', 'Yes, I met them yesterday.'],
      ex: 'minutes 在這裡是「會議紀錄」，正解說紀錄是 Sanjay 寫的，請對方找他。forty minutes 用同一個字的另一個意思當陷阱。',
    },
    {
      q: 'Are the new safety regulations taking effect this month or next?',
      o: ["They've been in place since Monday.", "Yes, they're very effective.", 'The safety manual is on the shelf.'],
      ex: '兩個都不是：週一就已經生效了。effective 是 effect 的變形陷阱。',
    },
    {
      q: 'We should hire a temporary assistant for the holiday season.',
      o: ["There's nothing left in this year's budget.", 'Yes, it was a long season.', 'Higher than last year.'],
      ex: '提議請臨時助理，正解用「今年預算沒了」委婉否決。Higher 是 hire 的同音陷阱。',
    },
    {
      q: 'Where are we holding the orientation for new staff?',
      o: ['Ms. Chen is still finalizing the details.', 'On the first of next month.', 'About twenty new employees.'],
      ex: '「陳小姐還在確認細節」表示地點未定。另外兩個分別回答時間和人數。',
    },
  ],
  part3: [
    {
      lines: [
        ['W', "Hi, this is Carla Mendes from Brightline Fitness. I placed an order for five hundred brochures last week, and I'd like to bump that up to eight hundred if it's not too late."],
        ['M', "It's not too late, but there's a catch. The matte paper you chose is out of stock, and our supplier can't get more to us until the end of the month."],
        ['W', 'Oh, no. We need them for an open house on Saturday.'],
        ['M', "In that case, I'd recommend switching to our satin finish. It's normally a bit more expensive, but I'll keep it at the original price since the delay is on our end."],
        ['W', "That's fair. Will they be delivered by Friday, then?"],
        ['M', "Our delivery van only goes out to your area on Fridays after four. If you can come by the shop Thursday morning, though, they'll be ready."],
        ['W', "That works. I'll stop by on my way to the office."],
      ],
      qs: [
        {
          q: 'What does the woman want to do?',
          o: ['Increase the size of an order', 'Revise the design of a brochure', 'Cancel a purchase', 'Request a refund'],
          ex: 'bump that up to eight hundred：把數量從 500 份提高到 800 份。換紙是後來男子提議的，不是她打電話的目的。',
        },
        {
          q: 'What does the man offer?',
          o: ['A different material at no extra cost', 'A discount on the next order she places', 'Express delivery', 'A free sample'],
          ex: '改用 satin finish（緞面紙），平常比較貴，但維持原價。選項把 paper 換成 material、same price 換成 no extra cost。',
        },
        {
          q: 'What will the woman most likely do on Thursday?',
          o: ['Visit the shop', 'Receive a delivery', 'Attend an open house', 'Approve a proof'],
          ex: '男子說週四早上來店裡拿，她說會順路過去。送貨是週五，開放日是週六，都是時間陷阱。',
        },
      ],
    },
    {
      lines: [
        ['W', 'Okay, so the plan is to move the whole design department from the third floor to the sixth by the end of next week. Raj, is the space ready?'],
        ['M', "The furniture's already in, and the painters finish on Tuesday. So from my side, yes."],
        ['M2', "The problem is the workstations. Each one has to be disconnected, moved, and tested. I've only got two technicians this week."],
        ['W', "Hmm. What if we move the people and the desks first, and have them use laptops for a few days? Then your team can bring the workstations up the following week."],
        ['M2', 'That would definitely help. We could do five or six a day without rushing.'],
        ['M', "And I'll ask building management to keep the freight elevator reserved for us."],
      ],
      qs: [
        {
          q: 'What are the speakers mainly discussing?',
          o: ['Relocating a department', 'Renovating a lobby', 'Hiring technicians for a short-term project', 'Purchasing laptops'],
          ex: '設計部要從三樓搬到六樓。technicians、laptops 都有提到，但不是主題。',
        },
        {
          q: 'Why does the man say, "I\'ve only got two technicians this week"?',
          o: ['To explain that a deadline may be unrealistic', 'To request more training', 'To complain about a coworker', 'To refuse to take part in the move entirely'],
          ex: '言外之意：人手不夠，下週末前搬完所有電腦不太可能。他沒有拒絕，後來同意分兩週做。',
        },
        {
          q: 'What does the woman propose?',
          o: ['Moving some equipment at a later time', 'Postponing the entire move until next month', 'Renting additional office space', 'Having employees work from home'],
          ex: '先搬人和桌子，暫用筆電，電腦下週再搬。選項用 equipment 代替 workstations；她沒有說要整個延期，也沒有說在家工作。',
        },
      ],
    },
    {
      lines: [
        ['M', "Jill, the conference in Boston starts at eleven tomorrow. Did you book us on the eight-fifteen express?"],
        ['W', "I tried, but it's completely sold out. The eight-forty is still available, but that's the local, and it stops everywhere."],
        ['M', "Then we'd miss the opening remarks. What about the next express?"],
        ['W', "It gets in at eleven, so we'd miss the first half hour, but the session we really need is the keynote at eleven-thirty."],
        ['M', "Fine, let's do that. I'd rather walk in a little late than sit on a train for four hours."],
      ],
      graphic: {
        title: 'Harbor Line Departures to Boston',
        rows: [
          ['Time', 'Service', 'Platform'],
          ['8:15', 'Express', '2'],
          ['8:40', 'Local', '5'],
          ['9:05', 'Express', '3'],
          ['9:30', 'Local', '4'],
        ],
      },
      qs: [
        {
          q: 'Why are the speakers traveling to Boston?',
          o: ['To attend a conference', 'To meet a client', 'To give a presentation', 'To inspect a new manufacturing facility'],
          ex: 'the conference in Boston starts at eleven tomorrow。',
        },
        {
          q: 'What does the woman say about the eight-fifteen train?',
          o: ['It has no seats left.', 'It has been canceled.', 'It makes many stops.', 'It departs from a different station.'],
          ex: "it's completely sold out = 沒有座位了。「站站都停」說的是 8:40 的區間車，是陷阱。",
        },
        {
          q: 'Look at the graphic. Which platform will the speakers most likely depart from?',
          o: ['Platform 3', 'Platform 2', 'Platform 4', 'Platform 5'],
          ex: '他們決定搭「下一班快車」，也就是 9:05 那班，在 3 號月台。2 號月台是售完的 8:15。',
        },
      ],
    },
    {
      lines: [
        ['W', 'Marco, I just got a call from a friend at the Daily Herald. Their food critic is coming in tonight.'],
        ['M', "Tonight? You're kidding. Half my kitchen staff is out with the flu."],
        ['W', "I know the timing's terrible. And apparently she booked under a different name, so it's not like we can call and reschedule."],
        ['M', "All right. Then I'm taking the two most complicated dishes off tonight's menu. I'd rather serve eight things perfectly than ten things badly."],
        ['W', "Good call. I'll reprint the menus and let the servers know at the four o'clock meeting."],
      ],
      qs: [
        {
          q: 'What problem does the man mention?',
          o: ['Several employees are unavailable.', 'An ingredient has not been delivered.', 'A reservation was lost.', 'Some equipment is broken.'],
          ex: '一半的廚房人員感冒請假。選項把 kitchen staff out with the flu 換成 employees are unavailable。',
        },
        {
          q: 'Why does the woman say, "it\'s not like we can call and reschedule"?',
          o: ['To point out that a change is not possible', 'To suggest contacting a customer', 'To apologize for a mistake', 'To recommend hiring extra kitchen staff for the night'],
          ex: '評論家用別的名字訂位，餐廳不知道是哪一筆，所以沒辦法打電話改期。',
        },
        {
          q: 'What does the man decide to do?',
          o: ['Simplify the menu', 'Close the restaurant early', 'Call in a substitute chef', 'Prepare a special dish'],
          ex: '把兩道最複雜的菜從今晚菜單拿掉。重印菜單是女子要做的事。',
        },
      ],
    },
    {
      lines: [
        ['W', "Excuse me. I'm in room 512, and there's construction going on right outside the window. I have an early presentation tomorrow, and I really need some sleep."],
        ['M', "I'm so sorry about that. Unfortunately, the only rooms open tonight are suites, and those carry an additional charge of sixty dollars."],
        ['W', 'Is there anything else?'],
        ['M', "A standard room facing the courtyard opens up tomorrow, if you're staying with us a few more nights."],
        ['W', "I check out tomorrow afternoon, actually. You know what, I'll take the suite. My company is covering the hotel anyway."],
        ['M', "Of course. I'll have someone bring up a new key card along with complimentary breakfast vouchers."],
      ],
      qs: [
        {
          q: "What is the woman's complaint?",
          o: ['Her room is too noisy.', 'Her room is too small.', 'Her bill is incorrect.', 'Her key card does not work.'],
          ex: '窗外在施工，她睡不著。key card 是後面才出現的字，是陷阱。',
        },
        {
          q: 'Why does the woman accept the man\'s offer?',
          o: ['Her employer will pay for it.', 'She is staying several more nights.', 'The suite has a better view.', 'She was given a discount.'],
          ex: 'My company is covering the hotel anyway。她明天就退房，所以「住好幾晚」是錯的；男子也沒有給折扣。',
        },
        {
          q: 'What will the woman receive?',
          o: ['Meal vouchers', 'A late checkout', 'A refund', 'A free upgrade'],
          ex: 'complimentary breakfast vouchers = 免費早餐券。套房要加價，所以不是 free upgrade。',
        },
      ],
    },
    {
      lines: [
        ['W', "So the survey's in. Among customers under thirty, almost seventy percent said they'd order more often if we had a mobile app."],
        ['W2', "That's a big number. But have you seen what the developers quoted us?"],
        ['M', "I have. It's about twice what we spent on the whole website redesign."],
        ['W', 'What if we start smaller? Just ordering and payment, no loyalty program, no delivery tracking, at least for the first version.'],
        ['M', "That could cut the price considerably. I'll ask them to send a revised estimate for a basic version by Friday."],
      ],
      qs: [
        {
          q: 'What did the survey show?',
          o: ['Younger customers want a mobile app.', 'Customers are unhappy with delivery times.', 'The new website is popular.', 'Most customers prefer to pay in cash.'],
          ex: '三十歲以下的顧客約七成說有 app 會更常訂。網站和外送都有提到，但不是調查結果。',
        },
        {
          q: 'What does the woman imply when she says, "have you seen what the developers quoted us"?',
          o: ['The project may be too expensive.', 'The developers have not responded yet.', 'The survey results are inaccurate.', 'She would like to hire different developers.'],
          ex: 'quote 是報價。言外之意是價格太高，下一句男子也說是網站改版費用的兩倍。',
        },
        {
          q: 'What will the man ask the developers to do?',
          o: ['Provide a new cost estimate', 'Add a loyalty program', 'Finish building the app by Friday', 'Redesign the website'],
          ex: '請他們週五前提供基本版的新估價。by Friday 是報價的期限，不是完工期限。',
        },
      ],
    },
    {
      lines: [
        ['W', "Good morning. I have a ten o'clock interview with Orion Design. The directory says they're on the fourth floor?"],
        ['M', "Ah, that directory is out of date. Orion swapped floors with Medway Dental last month, so they're where the dentist is listed now."],
        ['W', 'Thanks for letting me know. I would have gone to the wrong office.'],
        ['M', "It happens a lot. Before you go up, though, I'll need you to sign the visitor log and show a photo ID."],
      ],
      graphic: {
        title: 'Kingsley Tower Directory',
        rows: [
          ['Floor', 'Tenant'],
          ['2', 'Harper Legal'],
          ['3', 'Medway Dental'],
          ['4', 'Orion Design'],
          ['5', 'Kessler Accounting'],
        ],
      },
      qs: [
        {
          q: 'Why is the woman visiting the building?',
          o: ['To attend a job interview', 'To see a dentist', 'To deliver a package to an accounting firm', 'To meet a lawyer'],
          ex: "I have a ten o'clock interview with Orion Design。",
        },
        {
          q: 'Look at the graphic. Which floor will the woman go to?',
          o: ['The third floor', 'The second floor', 'The fourth floor', 'The fifth floor'],
          ex: 'Orion 和牙醫互換樓層，現在在表上牙醫的位置，也就是 3 樓。表上寫的 4 樓是過時資訊，是陷阱。',
        },
        {
          q: 'What does the man ask the woman to do?',
          o: ['Provide identification', 'Wait in the lobby', 'Call the office', 'Update the information in a directory'],
          ex: 'show a photo ID = 出示身分證件，選項換句話說成 identification。',
        },
      ],
    },
    {
      lines: [
        ['M', "That's the third time this month our flour delivery has come in after we've already opened. We had to stop making bread at two locations yesterday."],
        ['W', "I've been looking at Granary Supply as an alternative. Their prices are about eight percent lower."],
        ['M', 'Then why not switch?'],
        ['W', "They only take orders of at least two tons a week. We'd have nowhere to store that much."],
        ['M', "Hmm. Then let's go back to our current supplier and ask for an earlier delivery window, maybe with a penalty if they're late."],
        ['W', "I'll set up a call with their account manager this afternoon."],
      ],
      qs: [
        {
          q: 'What problem are the speakers discussing?',
          o: ['Deliveries arriving late', 'Rising prices for key ingredients', 'A shortage of staff', 'Poor product quality'],
          ex: '這個月第三次在開店後才送到麵粉。八折的價格是在講另一家供應商。',
        },
        {
          q: 'What does the woman say about Granary Supply?',
          o: ['It requires large orders.', 'It is more expensive.', 'It has late deliveries.', 'It is located too far from their bakeries.'],
          ex: '每週至少要訂兩噸。它其實比較便宜，所以 more expensive 是反向陷阱。',
        },
        {
          q: 'What do the speakers decide to do?',
          o: ['Renegotiate with their current supplier', 'Switch to a new supplier', 'Rent a larger storage facility nearby', 'Raise the price of bread'],
          ex: '因為沒地方放貨，決定回頭跟現在的供應商談更早的送貨時段。「換供應商」是對話中途想到的，後來被否決。',
        },
      ],
    },
    {
      lines: [
        ['W', "Diego, are you free this Saturday? I have to take my certification exam, and I'm scheduled to open the store."],
        ['M', "Oh, my sister's getting married that day."],
        ['W', "Right, I forgot that was this weekend. Congratulations, by the way."],
        ['M', "Thanks. Have you asked Paulo? He mentioned last week that he's looking for extra hours."],
        ['W', "Not yet. I'll send him a message now. If he can't do it, I'll have to ask the manager to move my exam date."],
      ],
      qs: [
        {
          q: 'Why does the woman need time off?',
          o: ['To take a test', 'To attend a wedding', 'To go on vacation', 'To see a doctor'],
          ex: 'certification exam = 證照考試。參加婚禮的是男子，是陷阱。',
        },
        {
          q: 'What does the man mean when he says, "my sister\'s getting married that day"?',
          o: ['He is unable to help.', 'He needs a day off as well.', 'He wants to invite the woman.', 'He forgot about an event.'],
          ex: '用「那天妹妹結婚」間接拒絕代班。忘記的是女子，不是他。',
        },
        {
          q: 'What will the woman most likely do next?',
          o: ['Contact a coworker', 'Speak to the manager', 'Reschedule an exam', 'Open the store'],
          ex: "I'll send him a message now：先傳訊息給 Paulo。找經理改考試日期是 Paulo 不行才會做的事。",
        },
      ],
    },
    {
      lines: [
        ['M', 'Hi, I renewed my StreamDesk subscription yesterday, and my bank shows two charges of forty-nine dollars.'],
        ['W', "Let me take a look. Okay, I see the payment went through once. The second amount is a temporary authorization from your bank. It'll disappear on its own in three to five business days."],
        ['M', "So I don't need to do anything?"],
        ['W', "That's right. But if you'd like, I can e-mail you a statement showing a single payment, in case your bank asks."],
        ['M', 'Yes, please. That would give me some peace of mind.'],
      ],
      qs: [
        {
          q: 'Why is the man calling?',
          o: ['He believes he was billed twice.', 'He wants to cancel a subscription.', 'He cannot log in to his account.', 'He would like to upgrade his plan.'],
          ex: '銀行顯示兩筆 49 美元的扣款。選項把 two charges 換成 billed twice。',
        },
        {
          q: 'What does the woman say about one of the charges?',
          o: ['It will be removed automatically.', 'It was a late fee.', 'It must be disputed with the bank.', 'It is for a different service.'],
          ex: "It'll disappear on its own = 會自動消失。她說男子什麼都不用做，所以「要跟銀行申訴」是錯的。",
        },
        {
          q: 'What will the woman send the man?',
          o: ['A record of a transaction', 'A discount code for the next renewal', 'A new password', 'A refund form'],
          ex: '寄一份只顯示一筆付款的對帳單（statement），換句話說成 a record of a transaction。',
        },
      ],
    },
    {
      lines: [
        ['W', "For the luncheon with the Nakamura group, I was planning on the standard package for sixty people."],
        ['M', "I just heard from their assistant, though. About half of them are vegetarian, and the standard package doesn't include a vegetarian main."],
        ['W', "The next one up does, but that's over our budget of thirty dollars a person."],
        ['M', "Didn't the caterer say they'd take four dollars off any package for groups over fifty?"],
        ['W', 'Oh, you\'re right. That brings it under thirty. Let\'s go with that one.'],
      ],
      graphic: {
        title: 'Riverside Catering: Lunch Packages',
        rows: [
          ['Package', 'Price per person'],
          ['Basic', '$18'],
          ['Standard', '$24'],
          ['Deluxe', '$32'],
          ['Premium', '$40'],
        ],
      },
      qs: [
        {
          q: 'What event are the speakers planning?',
          o: ['A business lunch', 'A product launch', 'A staff party', 'A training workshop'],
          ex: 'the luncheon with the Nakamura group：和客戶的午宴。',
        },
        {
          q: 'What concern does the man raise?',
          o: ['Some guests have dietary needs.', 'The number of guests has increased.', 'The caterer is unavailable.', 'The venue is too small.'],
          ex: '約一半客人吃素，標準套餐沒有素食主菜。選項把 vegetarian 換成 dietary needs。',
        },
        {
          q: 'Look at the graphic. What is the regular price of the package the speakers choose?',
          o: ['$32', '$24', '$28', '$40'],
          ex: '「再上一級」的 Deluxe 原價 32 美元，折 4 美元後是 28。題目問的是原價（regular price），所以 $28 是陷阱。',
        },
      ],
    },
    {
      lines: [
        ['M', "So it's down to Ines Duarte and Tom Becker for the regional sales manager position. Ines has eight years in the industry. That's hard to beat."],
        ['M2', "True, but Tom speaks Portuguese, and we're opening the São Paulo office next spring. That's going to be half the job."],
        ['W', "You both make good points. I don't want to decide this between the three of us. Let's bring them both back to meet Ms. Albright. She'll be managing the Brazil launch."],
        ['M', "Fair enough. I'll contact them today and check her calendar for next week."],
      ],
      qs: [
        {
          q: 'What are the speakers discussing?',
          o: ['Choosing a job candidate', 'Opening a new store', 'Planning a business trip', 'Preparing a regional sales report'],
          ex: '討論區域業務經理的兩位候選人。',
        },
        {
          q: "Why does one of the men mention the São Paulo office?",
          o: ['To emphasize the value of a skill', 'To suggest a new location for a meeting', 'To explain a delay in a project', 'To request a transfer'],
          ex: '巴西說葡萄牙語，所以 Tom 會講葡萄牙語是很有用的能力。',
        },
        {
          q: 'What will most likely happen next week?',
          o: ['Both candidates will be interviewed again.', 'Ines Duarte will be offered the job.', 'The São Paulo office will open.', 'Ms. Albright will travel to the new office in Brazil.'],
          ex: '決定請兩人都回來見 Albright 女士。巴西辦公室明年春天才開，「錄取 Ines」是第一位男子的傾向，不是結論。',
        },
      ],
    },
    {
      lines: [
        ['W', 'Bad news. Halvorsen just moved our presentation up from Friday to Tuesday.'],
        ['M', "Tuesday? We haven't even gotten the survey data back from the research firm."],
        ['W', "I know. I told them that, but their whole leadership team is flying out Wednesday."],
        ['M', "Okay. Then let's present the preliminary numbers we have and send the full report once the data comes in."],
        ['W', "I think they'll accept that. I'll draft a short note explaining what's still to come."],
      ],
      qs: [
        {
          q: 'What has not been completed?',
          o: ['Collecting research results', 'Booking a meeting room', 'Hiring a firm to conduct a customer survey', 'Printing a report'],
          ex: '調查數據還沒從研究公司回來。他們已經有合作的研究公司，所以「僱用研究公司」是錯的。',
        },
        {
          q: 'Why does the woman say, "their whole leadership team is flying out Wednesday"?',
          o: ['To explain why a date cannot be changed', 'To suggest holding the meeting at the airport', 'To complain about a client', 'To propose a later deadline'],
          ex: '客戶高層週三就出國，所以只能週二報告，日期沒辦法再改。',
        },
        {
          q: 'What does the man suggest?',
          o: ['Presenting partial results', 'Asking for more time', 'Contacting the research firm', 'Canceling the presentation'],
          ex: '先報告初步數字（preliminary numbers），完整報告之後再寄，選項換句話說成 partial results。',
        },
      ],
    },
  ],
  part4: [
    {
      label: 'Telephone message',
      voice: 'W',
      text: "Hi, Mr. Lindqvist, it's Hannah from Crestview Realty. I'm afraid I have some disappointing news. The owner of the apartment on Elm Street has accepted another offer, one that was quite a bit above the asking price. But, and you'll want to hear this, the unit directly upstairs is going on the market next Monday. It has the same layout, it's been recently renovated, and it gets a lot more light. I can arrange a private viewing this Saturday, before it's listed publicly. Just call me back by Friday so I can confirm it with the owner.",
      qs: [
        {
          q: 'What is the purpose of the message?',
          o: ["To report that the listener's offer was unsuccessful", 'To confirm a viewing appointment', 'To request a signed contract', 'To announce a reduction in the asking price of a unit'],
          ex: '屋主接受了別人出價更高的報價，也就是聽者沒買到。',
        },
        {
          q: 'Why does the speaker say, "you\'ll want to hear this"?',
          o: ['To indicate that she has an opportunity to share', 'To apologize for a mistake', 'To ask the listener to call immediately', 'To warn the listener about a problem with a building'],
          ex: '轉折後要說好消息：樓上同格局的房子要釋出了。',
        },
        {
          q: 'What does the speaker ask the listener to do?',
          o: ['Contact her by Friday', 'Visit the apartment on Monday', 'Make a higher offer', 'Meet the owner on Saturday'],
          ex: 'call me back by Friday。看房是週六，上市是週一，都是時間陷阱。',
        },
      ],
    },
    {
      label: 'Announcement',
      voice: 'M',
      text: "Attention, passengers. Pacific Air flight 344 to Phoenix has been canceled due to a technical issue with the aircraft. Passengers on that flight can rebook on our mobile app at no charge, and priority will be given to those with connecting flights. Also, please note that flight 210 to Denver will no longer depart from Gate B4. It will now board at the gate originally assigned to the Phoenix flight. Boarding for Denver will begin in approximately twenty minutes.",
      graphic: {
        title: 'Departures',
        rows: [
          ['Flight', 'Destination', 'Gate'],
          ['PA 210', 'Denver', 'B4'],
          ['PA 344', 'Phoenix', 'C9'],
          ['PA 518', 'Seattle', 'C2'],
          ['PA 602', 'Dallas', 'B7'],
        ],
      },
      qs: [
        {
          q: 'Why was a flight canceled?',
          o: ['There was a mechanical problem.', 'The weather was poor.', 'A member of the flight crew was not available.', 'The airport was closed.'],
          ex: 'a technical issue with the aircraft = 飛機有技術問題，換句話說成 mechanical problem。',
        },
        {
          q: 'How can passengers on the canceled flight change their booking?',
          o: ['By using a mobile application', 'By going to the service desk', 'By calling a customer hotline', 'By speaking to an agent at the departure gate'],
          ex: 'rebook on our mobile app at no charge。',
        },
        {
          q: 'Look at the graphic. Where should passengers going to Denver go?',
          o: ['Gate C9', 'Gate B4', 'Gate C2', 'Gate B7'],
          ex: '丹佛班機改到「原本分配給鳳凰城班機的登機門」，也就是 C9。B4 是原本的登機門，是陷阱。',
        },
      ],
    },
    {
      label: 'Excerpt from a meeting',
      voice: 'W',
      text: "Let's look at the third-quarter numbers. Online orders were up eighteen percent compared with last year, while in-store sales fell for the third quarter in a row. Now, I know what some of you are thinking, and no, we are not closing any locations. What we are doing is converting our Westgate and Millbrook stores into pickup centers. Customers will order online and collect their items there, usually within two hours. Store managers at those two locations will receive the new floor plans next week, and we'll be holding training sessions for staff throughout November.",
      qs: [
        {
          q: 'What does the speaker say about online orders?',
          o: ['They increased.', 'They decreased.', 'They stayed the same.', 'They were delayed.'],
          ex: 'Online orders were up eighteen percent。下滑的是實體店業績。',
        },
        {
          q: 'Why does the speaker say, "I know what some of you are thinking"?',
          o: ['To acknowledge a concern among the listeners', 'To ask for suggestions', 'To introduce a new manager', 'To move on to a different topic of the meeting'],
          ex: '實體店業績連三季下滑，大家擔心會關店，她先點出這個擔憂再否認。',
        },
        {
          q: 'What will happen to two stores?',
          o: ['They will serve a new purpose.', 'They will be closed.', 'They will be relocated to a busier shopping area.', 'They will be sold.'],
          ex: '改成取貨中心（converting into pickup centers），換句話說成 serve a new purpose。她明確說不會關店，所以 closed 是陷阱。',
        },
      ],
    },
    {
      label: 'Advertisement',
      voice: 'M',
      text: "Running a small business means wearing a lot of hats, and bookkeeping probably isn't your favorite one. That's where LedgerLeaf comes in. Just snap a photo of any receipt with your phone, and LedgerLeaf reads it, sorts it, and files it in the right category, no typing required. At tax time, your reports are ready with one click. New users normally get a thirty-day free trial, but sign up before the end of this month, and we'll double it to sixty days. Visit ledgerleaf dot com to get started.",
      qs: [
        {
          q: 'What is being advertised?',
          o: ['Accounting software', 'A photography service', 'A tax consulting firm', 'A mobile phone plan'],
          ex: 'bookkeeping（記帳）軟體。拍照只是功能，不是在賣攝影服務。',
        },
        {
          q: 'What feature of the product does the speaker mention?',
          o: ['It can process images of receipts.', 'It connects to bank accounts.', 'It offers live customer support.', 'It works without an Internet connection.'],
          ex: '拍下收據，它會讀取、分類、歸檔，換句話說成 process images of receipts。',
        },
        {
          q: 'How can listeners receive a longer free trial?',
          o: ['By registering before the end of the month', 'By referring a friend', 'By downloading a mobile app', 'By purchasing an annual plan in advance'],
          ex: 'sign up before the end of this month, and we\'ll double it to sixty days。',
        },
      ],
    },
    {
      label: 'Tour information',
      voice: 'W',
      text: "Good morning, and welcome to Ashford Gardens. I'm Priya, and I'll be guiding you today. Here's your itinerary for the morning. Normally we'd begin outdoors in the Sculpture Garden, but with this rain, we're going to swap our first and third stops. That way, by the time we head outside, the weather should have cleared. Everything else stays the same, including our coffee break at the end. Before we start, please leave any large bags at the coat check to your left. They aren't permitted inside the exhibition halls.",
      graphic: {
        title: 'Morning Tour Itinerary',
        rows: [
          ['Time', 'Stop'],
          ['10:00', 'Sculpture Garden'],
          ['10:30', 'Textile Hall'],
          ['11:00', 'Map Room'],
          ['11:30', 'Garden Café'],
        ],
      },
      qs: [
        {
          q: 'Why has the schedule been changed?',
          o: ['Because of the weather', 'Because a hall is closed', 'Because the group arrived late', 'Because a guide is unavailable'],
          ex: 'with this rain：因為下雨。',
        },
        {
          q: 'Look at the graphic. Where will the group be at eleven o\'clock?',
          o: ['Sculpture Garden', 'Map Room', 'Textile Hall', 'Garden Café'],
          ex: '第一站和第三站對調：10:00 去地圖室，11:00 改去雕塑花園。表上 11:00 寫的地圖室是陷阱。',
        },
        {
          q: 'What are listeners asked to do?',
          o: ['Check large bags', 'Buy tickets', 'Turn off their phones', 'Stay with the group'],
          ex: 'please leave any large bags at the coat check：大型包包要寄放。',
        },
      ],
    },
    {
      label: 'News report',
      voice: 'M',
      text: "In local news, the Fairview City Council voted last night to approve the Riverside bike lane project, which will add twelve kilometers of protected lanes along the river. Construction was originally expected to begin this spring, but it's now been pushed back to the fall while the council completes a review of the project's funding. Council member Rita Okafor said the delay would also give residents more time to share their views. Comments can be submitted through the city's website until the end of June.",
      qs: [
        {
          q: 'What has the city council approved?',
          o: ['A cycling route', 'A new bridge', 'A park renovation', 'A parking garage'],
          ex: 'bike lane project 換句話說成 cycling route。',
        },
        {
          q: 'Why has the project been delayed?',
          o: ['Financial details are being examined.', 'The council has not voted yet.', 'Residents have opposed the plan.', 'The weather has been poor.'],
          ex: 'a review of the project\'s funding：資金在審查中。議會昨晚已經通過了，所以「還沒投票」是陷阱。',
        },
        {
          q: 'According to the speaker, what can listeners do online?',
          o: ['Give their opinions', 'Apply for a job', 'Watch the council meeting', 'Register for a bike'],
          ex: 'share their views / Comments can be submitted through the city\'s website。',
        },
      ],
    },
    {
      label: 'Talk',
      voice: 'W',
      text: "Welcome back, everyone. In this session, we're going to talk about presenting to senior leadership, something all of you will be doing a lot more now that you're managers. Most of you probably think the safest approach is to memorize your presentation word for word. Well, I tried that once. Ten minutes in, the vice president asked me a question, and I lost my place completely. What works much better is knowing your three key messages and the data behind them. So, let's put that into practice. Find a partner, and take five minutes to write down the three key messages of your next presentation.",
      qs: [
        {
          q: 'Who most likely are the listeners?',
          o: ['Recently promoted managers', 'Vice presidents', 'Sales representatives who have just been hired', 'University students'],
          ex: "now that you're managers：剛升上經理的人。副總裁是故事裡的角色。",
        },
        {
          q: 'What does the speaker imply when she says, "I tried that once"?',
          o: ['The method did not work for her.', 'She recommends the method.', 'She has little experience presenting.', 'She will demonstrate the method.'],
          ex: '接著說被提問後完全接不下去，暗示背稿行不通。',
        },
        {
          q: 'What will the listeners do next?',
          o: ['Work in pairs', 'Watch a video', 'Give a presentation', 'Take a short break'],
          ex: 'Find a partner, and take five minutes to write down…。',
        },
      ],
    },
    {
      label: 'Recorded message',
      voice: 'M',
      text: "You've reached Norvale Power. We're aware of an outage affecting the Eastbrook and Hillside areas. Crews are on site, and we expect power to be restored by six P.M. this evening. If you rely on medical equipment at home, please press three to be connected with our priority response team. There's no need to contact us about your bill. Customers in the affected areas will automatically receive a credit on their next statement. For live updates, visit our outage map at norvale power dot com.",
      qs: [
        {
          q: 'What is the purpose of the message?',
          o: ['To provide information about a service interruption', 'To announce a change in billing dates', 'To advertise new equipment', 'To explain why electricity rates are increasing'],
          ex: '說明停電的情況，換句話說成 service interruption。',
        },
        {
          q: 'Why should some callers press three?',
          o: ['They use medical devices.', 'They want to report an outage.', 'They have a billing question.', 'They would like a repair appointment.'],
          ex: '家裡有醫療設備的人按 3，轉接優先處理小組。',
        },
        {
          q: "What does the speaker say about customers' bills?",
          o: ['An adjustment will be made automatically.', 'Customers must call to request a credit on their bills.', 'Payments will be delayed.', 'Bills can be paid online.'],
          ex: '受影響的客戶下期帳單會自動抵扣，不用另外聯絡。「要自己申請」是反向陷阱。',
        },
      ],
    },
    {
      label: 'Speech',
      voice: 'W',
      text: "Good evening, everyone. It's my pleasure to present this year's Employee of the Year award to Daniela Ruiz from our logistics team. Daniela redesigned our delivery routes across the northern region, which cut our shipping costs by nearly fifteen percent. And she did all of that while training five new hires. Honestly, I still don't know when she slept. In recognition of her work, Daniela will receive this plaque, along with five additional days of paid vacation. Daniela, please come up and say a few words.",
      qs: [
        {
          q: 'What did Ms. Ruiz achieve?',
          o: ['She lowered transportation expenses.', 'She opened a new regional office.', 'She increased sales by fifteen percent.', 'She designed a training program.'],
          ex: '重新規劃配送路線，運費降了將近 15%。15% 是成本降低的幅度，不是業績成長。',
        },
        {
          q: 'What does the speaker imply when she says, "I still don\'t know when she slept"?',
          o: ['Ms. Ruiz worked extremely hard.', 'Ms. Ruiz often arrived late.', 'Ms. Ruiz needs more support.', 'Ms. Ruiz usually works the night shift at the warehouse.'],
          ex: '一邊改路線一邊帶五個新人，誇張地稱讚她非常努力。',
        },
        {
          q: 'What will Ms. Ruiz receive in addition to a plaque?',
          o: ['Extra paid time off', 'A cash bonus', 'A promotion', 'A car provided by the company'],
          ex: 'five additional days of paid vacation 換句話說成 extra paid time off。',
        },
      ],
    },
    {
      label: 'Excerpt from a meeting',
      voice: 'M',
      text: "Thanks for joining, everyone. I want to start with the sales figures for our Clearwell sparkling water. As you can see on the chart, there was a noticeable dip the month we switched to the new recycled bottles. Customers simply didn't recognize the product on the shelf. But once they got used to the new look, sales recovered, and the following month was actually our best so far. Now, with summer coming, I'd like each team to propose one idea for a seasonal campaign. Please send your ideas to me by next Friday.",
      graphic: {
        title: 'Clearwell Monthly Sales (units)',
        rows: [
          ['Month', 'Units sold'],
          ['January', '12,000'],
          ['February', '9,500'],
          ['March', '14,000'],
          ['April', '11,000'],
        ],
      },
      qs: [
        {
          q: 'Look at the graphic. In which month did the company change its packaging?',
          o: ['February', 'January', 'March', 'April'],
          ex: '換新瓶子那個月銷量明顯下滑，也就是 2 月。3 月是回升後最好的月份。',
        },
        {
          q: 'According to the speaker, why did sales decrease?',
          o: ['Customers did not recognize the product.', 'The price was increased.', 'A competitor launched a similar product at a lower price.', 'There was a shortage of bottles.'],
          ex: "Customers simply didn't recognize the product on the shelf。",
        },
        {
          q: 'What are the listeners asked to do?',
          o: ['Submit ideas for a campaign', 'Design a new bottle', 'Prepare a sales report', 'Contact customers who stopped buying the product'],
          ex: '每組下週五前提一個夏季活動的點子。',
        },
      ],
    },
  ],
}
