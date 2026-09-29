import type { Card } from './flashcards'
import { addDaysKey } from '../utils/date'
import { WORDS_600 } from './words600'
import { WORDS_800 } from './words800'
import { WORDS_900 } from './words900'

export type Level = 600 | 800 | 900

export const LEVELS: { value: Level; label: string; desc: string }[] = [
  { value: 600, label: '600 分', desc: '基礎職場單字' },
  { value: 800, label: '800 分', desc: '600 + 進階商務' },
  { value: 900, label: '900 分以上', desc: '全部單字，含高階字彙' },
]

// 欄位：單字, KK 音標, 詞性, 中文, 英英解釋, 同義詞, 反義詞, 例句, 例句翻譯
// 同義詞 / 反義詞以「, 」分隔，沒有則留空字串
export type RawWord = [string, string, string, string, string, string, string, string, string]

export interface WordInfo {
  level: Level
  word: string
  kk: string
  pos: string
  zh: string
  /** 英英解釋（學習者程度的自編釋義，完整釋義請見劍橋字典連結） */
  def: string
  syn: string[]
  ant: string[]
  ex: string
  exZh: string
}

// 核心 120 字，分級見下方 CORE_900 / CORE_800，其餘為 600
const CORE: RawWord[] = [
  ['agenda', '[əˋdʒɛndə]', 'n.', '議程', 'a list of things to be discussed at a meeting', 'schedule, program', '', "Let's move on to the next item on the agenda.", '我們進行議程的下一項吧。'],
  ['appointment', '[əˋpɔɪntmənt]', 'n.', '約會；預約；任命', 'an arrangement to meet someone at a particular time', 'meeting, engagement', '', 'I have a dental appointment at 3 p.m.', '我下午三點約了看牙醫。'],
  ['approve', '[əˋpruv]', 'v.', '批准；贊成', 'to officially accept a plan, request, or idea', 'authorize, accept', 'reject, deny', 'The manager approved my vacation request.', '經理批准了我的休假申請。'],
  ['attach', '[əˋtætʃ]', 'v.', '附上；連接', 'to add a file or document to an email or letter; to fasten one thing to another', 'enclose, fasten', 'detach', 'Please attach your résumé to the email.', '請將履歷附在電子郵件中。'],
  ['available', '[əˋveləbḷ]', 'adj.', '可用的；有空的', 'able to be used or obtained; free to do something', 'accessible, free', 'unavailable, busy', 'Is the conference room available this afternoon?', '今天下午會議室可以使用嗎？'],
  ['budget', '[ˋbʌdʒɪt]', 'n.', '預算', 'the amount of money that is available to spend on something', 'allowance, funds', '', 'The project was completed under budget.', '這項專案以低於預算的花費完成。'],
  ['candidate', '[ˋkændəˏdet]', 'n.', '候選人；應徵者', 'a person who is applying for a job or being considered for a position', 'applicant, nominee', '', 'We interviewed five candidates for the position.', '我們為這個職位面試了五位應徵者。'],
  ['colleague', '[ˋkɑlig]', 'n.', '同事', 'a person that you work with', 'coworker, associate', '', 'I had lunch with a few colleagues today.', '我今天和幾位同事吃了午餐。'],
  ['conference', '[ˋkɑnfərəns]', 'n.', '會議；研討會', 'a large formal meeting where people discuss a subject', 'meeting, convention', '', 'She will speak at the marketing conference next week.', '她下週將在行銷研討會上演講。'],
  ['confirm', '[kənˋfɝm]', 'v.', '確認', 'to say or show that something is true or definitely arranged', 'verify, validate', 'cancel, deny', 'Please confirm your reservation by Friday.', '請在週五前確認您的預約。'],
  ['contract', '[ˋkɑntrækt]', 'n.', '合約', 'a legal written agreement between people or companies', 'agreement, deal', '', 'Both parties signed the contract yesterday.', '雙方昨天簽署了合約。'],
  ['deadline', '[ˋdɛdˏlaɪn]', 'n.', '截止期限', 'a time or date by which something must be finished', 'due date, time limit', '', 'The deadline for the report is Monday.', '報告的截止日是星期一。'],
  ['delay', '[dɪˋle]', 'v./n.', '延誤；延遲', 'to make something happen later than planned', 'postpone, hold up', 'hurry, expedite', 'Our flight was delayed by two hours.', '我們的班機延誤了兩小時。'],
  ['department', '[dɪˋpɑrtmənt]', 'n.', '部門', 'a part of an organization that deals with a particular area of work', 'division, section', '', 'He works in the sales department.', '他在業務部門工作。'],
  ['distribute', '[dɪˋstrɪbjut]', 'v.', '分發；配送', 'to give or deliver something to many people or places', 'hand out, deliver', 'collect, gather', 'The flyers were distributed to all employees.', '傳單已分發給所有員工。'],
  ['estimate', '[ˋɛstəˏmet]', 'v./n.', '估計；估價', 'to guess the size, cost, or value of something without measuring it exactly', 'calculate, assess', '', 'We estimate that the repairs will cost $500.', '我們估計維修費用約 500 美元。'],
  ['expense', '[ɪkˋspɛns]', 'n.', '費用；開支', 'money that is spent on something', 'cost, expenditure', 'income, revenue', 'Travel expenses will be paid by the company.', '差旅費用將由公司支付。'],
  ['facility', '[fəˋsɪlətɪ]', 'n.', '設施', 'a building, room, or piece of equipment provided for a particular purpose', 'amenity, building', '', 'The hotel has excellent fitness facilities.', '這間飯店有很好的健身設施。'],
  ['invoice', '[ˋɪnvɔɪs]', 'n.', '發票；請款單', 'a document that lists goods or services and states how much must be paid', 'bill, statement', '', 'Please send the invoice to our accounting department.', '請把請款單寄到我們的會計部。'],
  ['merchandise', '[ˋmɝtʃənˏdaɪz]', 'n.', '商品', 'goods that are bought and sold', 'goods, products', '', 'All merchandise is 20% off this week.', '本週所有商品打八折。'],
  ['negotiate', '[nɪˋgoʃɪˏet]', 'v.', '談判；協商', 'to discuss something formally in order to reach an agreement', 'bargain, discuss', '', 'We negotiated a lower price with the supplier.', '我們和供應商談到了更低的價格。'],
  ['postpone', '[postˋpon]', 'v.', '延期', 'to move an event to a later time or date', 'delay, put off', 'advance', 'The meeting has been postponed until next week.', '會議已延到下週。'],
  ['purchase', '[ˋpɝtʃəs]', 'v./n.', '購買', 'to buy something', 'buy, acquire', 'sell', 'You can purchase tickets online.', '你可以在網路上購票。'],
  ['recruit', '[rɪˋkrut]', 'v.', '招募', 'to find new people to join a company or organization', 'hire, enlist', 'dismiss, fire', 'The company plans to recruit 50 new engineers.', '公司計畫招募 50 名新工程師。'],
  ['reimburse', '[ˏriɪmˋbɝs]', 'v.', '報銷；償還', 'to pay back money that someone has spent', 'repay, refund', '', 'The company will reimburse you for the taxi fare.', '公司會報銷你的計程車費。'],
  ['revenue', '[ˋrɛvəˏnju]', 'n.', '收入；營收', 'the income that a company receives from its business', 'income, earnings', 'expense', 'Annual revenue rose by 15%.', '年營收成長了 15%。'],
  ['schedule', '[ˋskɛdʒʊl]', 'n./v.', '時間表；安排', 'a plan that lists when things will happen; to arrange something for a particular time', 'timetable, arrange', '', 'The meeting is scheduled for 10 a.m.', '會議安排在上午十點。'],
  ['shipment', '[ˋʃɪpmənt]', 'n.', '運送；貨物', 'a load of goods sent together, or the act of sending them', 'delivery, consignment', '', 'The shipment should arrive by Thursday.', '這批貨應該會在週四前送達。'],
  ['supervisor', '[ˏsupɚˋvaɪzɚ]', 'n.', '主管；監督者', 'a person who is in charge of a group of workers', 'manager, boss', 'subordinate', 'Ask your supervisor for approval.', '請向你的主管申請核准。'],
  ['warranty', '[ˋwɔrəntɪ]', 'n.', '保固；保證書', 'a written promise to repair or replace a product if it breaks within a certain time', 'guarantee', '', 'The laptop comes with a two-year warranty.', '這台筆電附兩年保固。'],
  ['inventory', '[ˋɪnvənˏtorɪ]', 'n.', '庫存；存貨清單', 'all the goods a business has in stock, or a list of them', 'stock, supply', '', 'We take inventory at the end of each month.', '我們每個月底盤點庫存。'],
  ['itinerary', '[aɪˋtɪnəˏrɛrɪ]', 'n.', '行程表', 'a detailed plan of a journey', 'schedule, route', '', "I'll email you the travel itinerary.", '我會把旅遊行程表寄給你。'],
  ['quarterly', '[ˋkwɔrtɚlɪ]', 'adj.', '每季的', 'happening or produced every three months', 'three-monthly', '', 'The quarterly sales report is due next week.', '季度銷售報告下週截止。'],
  ['refund', '[ˋriˏfʌnd]', 'n./v.', '退款', 'money that is given back to you, for example when you return a product', 'reimbursement, repayment', 'charge', 'You can get a full refund within 30 days.', '30 天內可全額退款。'],
  ['renovation', '[ˏrɛnəˋveʃən]', 'n.', '翻修；整修', 'the work of repairing and improving a building', 'remodeling, restoration', '', 'The lobby is closed for renovation.', '大廳因整修而關閉。'],
  ['reservation', '[ˏrɛzɚˋveʃən]', 'n.', '預訂', 'an arrangement to keep a table, room, or seat for someone', 'booking', 'cancellation', "I'd like to make a reservation for two.", '我想訂兩人的位子。'],
  ['subscription', '[səbˋskrɪpʃən]', 'n.', '訂閱', 'money you pay regularly to receive a service or publication', 'membership', 'cancellation', 'My magazine subscription expires next month.', '我的雜誌訂閱下個月到期。'],
  ['venue', '[ˋvɛnju]', 'n.', '舉辦地點；場地', 'the place where an event or meeting happens', 'location, site', '', 'The venue for the awards ceremony has changed.', '頒獎典禮的場地改了。'],
  ['accommodate', '[əˋkɑməˏdet]', 'v.', '容納；提供住宿', 'to have enough space for; to provide a place to stay; to meet someone’s needs', 'hold, house', '', 'The hall can accommodate 300 guests.', '這個大廳可容納 300 位賓客。'],
  ['acquire', '[əˋkwaɪr]', 'v.', '取得；收購', 'to get or buy something, especially a company', 'obtain, purchase', 'sell, lose', 'The firm acquired a small software company.', '這家公司收購了一間小型軟體公司。'],
  ['applicant', '[ˋæpləkənt]', 'n.', '申請人', 'a person who formally asks for something, such as a job', 'candidate', '', 'All applicants must submit two references.', '所有申請人都必須提交兩封推薦信。'],
  ['assess', '[əˋsɛs]', 'v.', '評估', 'to judge the quality, value, or importance of something', 'evaluate, judge', '', 'We need to assess the risks before investing.', '投資前我們需要評估風險。'],
  ['assign', '[əˋsaɪn]', 'v.', '指派；分配', 'to give someone a job or task, or send them to work somewhere', 'allocate, appoint', '', 'She was assigned to the Tokyo office.', '她被派到東京辦公室。'],
  ['audit', '[ˋɔdɪt]', 'n./v.', '審計；查帳', 'an official examination of a company’s financial records', 'inspection, review', '', 'The annual audit will begin next month.', '年度審計將於下個月開始。'],
  ['brochure', '[broˋʃʊr]', 'n.', '小冊子', 'a thin book with pictures and information about a product or service', 'pamphlet, leaflet', '', 'Please take a brochure at the front desk.', '請在櫃台拿一份簡介手冊。'],
  ['compliance', '[kəmˋplaɪəns]', 'n.', '遵守；合規', 'the act of obeying a rule, law, or request', 'obedience, conformity', 'violation', 'All products must be in compliance with safety standards.', '所有產品都必須符合安全標準。'],
  ['comprehensive', '[ˏkɑmprɪˋhɛnsɪv]', 'adj.', '全面的；綜合的', 'including everything or almost everything', 'thorough, complete', 'limited, partial', 'We offer a comprehensive training program.', '我們提供全面的培訓課程。'],
  ['consecutive', '[kənˋsɛkjʊtɪv]', 'adj.', '連續的', 'following one after another without a break', 'successive, continuous', 'interrupted', 'Sales have grown for three consecutive years.', '銷售額已連續三年成長。'],
  ['customize', '[ˋkʌstəmˏaɪz]', 'v.', '客製化', 'to change something to suit a particular person’s needs', 'personalize, tailor', 'standardize', "You can customize the app's settings.", '你可以自訂這個 App 的設定。'],
  ['defective', '[dɪˋfɛktɪv]', 'adj.', '有缺陷的', 'having a fault; not working correctly', 'faulty, flawed', 'perfect, working', 'Defective items can be returned for a refund.', '瑕疵品可退貨退款。'],
  ['eligible', '[ˋɛlɪdʒəbḷ]', 'adj.', '有資格的', 'having the right qualifications to do or receive something', 'qualified, entitled', 'ineligible', 'Full-time employees are eligible for health insurance.', '全職員工有資格享有健康保險。'],
  ['enclose', '[ɪnˋkloz]', 'v.', '隨函附上', 'to put something in an envelope together with a letter', 'include, attach', '', 'I have enclosed a copy of the invoice.', '隨函附上請款單影本一份。'],
  ['enhance', '[ɪnˋhæns]', 'v.', '提升；增強', 'to improve the quality, value, or strength of something', 'improve, boost', 'reduce, weaken', 'The new software will enhance productivity.', '新軟體將提升生產力。'],
  ['expire', '[ɪkˋspaɪr]', 'v.', '到期；失效', 'to stop being valid after a fixed period of time', 'end, lapse', 'renew', 'My passport expires in June.', '我的護照六月到期。'],
  ['feasible', '[ˋfizəbḷ]', 'adj.', '可行的', 'possible to do or achieve', 'practical, workable', 'impossible, impractical', 'Is it feasible to finish the project by May?', '五月前完成這項專案可行嗎？'],
  ['implement', '[ˋɪmpləˏmɛnt]', 'v.', '實施；執行', 'to put a plan or system into action', 'carry out, execute', '', 'The new policy will be implemented next year.', '新政策將於明年實施。'],
  ['inquiry', '[ɪnˋkwaɪrɪ]', 'n.', '詢問', 'a question you ask to get information', 'question, query', 'reply, answer', 'Thank you for your inquiry about our services.', '感謝您詢問我們的服務。'],
  ['install', '[ɪnˋstɔl]', 'v.', '安裝', 'to put equipment or software in place so that it can be used', 'set up', 'uninstall, remove', 'A technician will install the new printer.', '技術人員會來安裝新印表機。'],
  ['launch', '[lɔntʃ]', 'v./n.', '推出；發表', 'to start or introduce a new product, service, or activity', 'introduce, release', '', 'The company will launch a new smartphone in May.', '公司將在五月推出新手機。'],
  ['merger', '[ˋmɝdʒɚ]', 'n.', '合併', 'the joining together of two companies into one', 'combination, union', 'split, separation', 'The merger created the largest bank in the country.', '這次合併造就了全國最大的銀行。'],
  ['mandatory', '[ˋmændəˏtorɪ]', 'adj.', '強制的；必須的', 'required by a rule or law', 'compulsory, required', 'optional, voluntary', 'Attendance at the safety training is mandatory.', '安全訓練必須出席。'],
  ['notify', '[ˋnotəˏfaɪ]', 'v.', '通知', 'to officially tell someone about something', 'inform, advise', '', 'Please notify us of any change of address.', '地址若有變更請通知我們。'],
  ['outstanding', '[aʊtˋstændɪŋ]', 'adj.', '傑出的；未付清的', 'extremely good; also, not yet paid or done', 'excellent, unpaid', 'mediocre, paid', 'She received an award for outstanding performance.', '她因表現傑出而獲獎。'],
  ['personnel', '[ˏpɝsṇˋɛl]', 'n.', '全體員工；人事部門', 'the people who work for an organization, or the department that deals with them', 'staff, employees', '', 'Only authorized personnel may enter this area.', '只有授權人員可進入此區。'],
  ['preliminary', '[prɪˋlɪməˏnɛrɪ]', 'adj.', '初步的', 'coming before the main or final part', 'initial, introductory', 'final', 'The preliminary results look promising.', '初步結果看起來很有希望。'],
  ['promote', '[prəˋmot]', 'v.', '升職；促銷', 'to move someone to a higher position; to advertise a product', 'upgrade, advertise', 'demote', 'He was promoted to sales manager.', '他升為業務經理。'],
  ['proposal', '[prəˋpozḷ]', 'n.', '提案；建議', 'a plan or suggestion that is put forward for people to consider', 'plan, suggestion', '', 'The board accepted our proposal.', '董事會接受了我們的提案。'],
  ['qualified', '[ˋkwɑləˏfaɪd]', 'adj.', '合格的；有資格的', 'having the skills, knowledge, or training for a job', 'skilled, competent', 'unqualified', 'We are looking for a qualified accountant.', '我們正在找一位合格的會計師。'],
  ['receipt', '[rɪˋsit]', 'n.', '收據', 'a piece of paper that shows you have paid for something', 'proof of purchase', '', 'Keep your receipt in case you need to return the item.', '請保留收據，以便日後退貨。'],
  ['reference', '[ˋrɛfərəns]', 'n.', '推薦信；參考', 'a letter describing a job applicant’s character and abilities; a mention of something', 'recommendation, testimonial', '', 'My former boss wrote me a reference.', '我的前主管幫我寫了推薦信。'],
  ['register', '[ˋrɛdʒɪstɚ]', 'v.', '登記；註冊', 'to put your name on an official list', 'sign up, enroll', 'withdraw', 'You must register for the seminar by Friday.', '你必須在週五前報名研討會。'],
  ['relocate', '[riˋloket]', 'v.', '搬遷；調職', 'to move to a new place to live or work', 'move, transfer', 'stay', 'Our office is relocating to downtown.', '我們辦公室要搬到市中心。'],
  ['representative', '[ˏrɛprɪˋzɛntətɪv]', 'n.', '代表；業務員', 'a person who speaks or acts for a company or group', 'agent, delegate', '', 'A sales representative will contact you soon.', '業務代表很快會與您聯絡。'],
  ['retail', '[ˋritel]', 'n./adj.', '零售', 'the sale of goods directly to the public', 'selling', 'wholesale', 'She has ten years of experience in retail.', '她有十年的零售業經驗。'],
  ['revise', '[rɪˋvaɪz]', 'v.', '修改；修訂', 'to change something in order to improve or correct it', 'amend, edit', '', 'Please revise the report and send it back.', '請修改報告後再寄回來。'],
  ['supplier', '[səˋplaɪɚ]', 'n.', '供應商', 'a company that provides goods to other businesses', 'provider, vendor', 'customer, buyer', 'We are looking for a new paper supplier.', '我們正在找新的紙張供應商。'],
  ['tentative', '[ˋtɛntətɪv]', 'adj.', '暫定的', 'not definite or certain, and may be changed later', 'provisional, temporary', 'definite, final', 'We have a tentative date for the launch.', '我們已有暫定的上市日期。'],
  ['transaction', '[trænˋzækʃən]', 'n.', '交易', 'an act of buying or selling something', 'deal, exchange', '', 'All transactions are recorded in the system.', '所有交易都記錄在系統中。'],
  ['valid', '[ˋvælɪd]', 'adj.', '有效的', 'legally or officially acceptable; based on good reasons', 'effective, legitimate', 'invalid, expired', 'This ticket is valid for one year.', '這張票一年內有效。'],
  ['vendor', '[ˋvɛndɚ]', 'n.', '攤販；供應商', 'a person or company that sells something', 'seller, supplier', 'buyer, customer', 'We compared prices from three vendors.', '我們比較了三家供應商的價格。'],
  ['wholesale', '[ˋholˏsel]', 'n./adj.', '批發', 'the sale of goods in large amounts to businesses rather than the public', 'bulk', 'retail', 'We buy our supplies at wholesale prices.', '我們以批發價購買用品。'],
  ['attendance', '[əˋtɛndəns]', 'n.', '出席；出席人數', 'being present at an event, or the number of people present', 'presence, turnout', 'absence', 'Attendance at the meeting was lower than expected.', '會議出席人數比預期少。'],
  ['complimentary', '[ˏkɑmpləˋmɛntərɪ]', 'adj.', '免費贈送的；讚美的', 'given free of charge; expressing praise', 'free, flattering', 'critical', 'Guests receive a complimentary breakfast.', '房客享有免費早餐。'],
  ['considerable', '[kənˋsɪdərəbḷ]', 'adj.', '相當大的', 'large in size, amount, or importance', 'significant, substantial', 'minor, small', 'The project required a considerable amount of time.', '這項專案花了相當多的時間。'],
  ['description', '[dɪˋskrɪpʃən]', 'n.', '描述；說明', 'words that explain what someone or something is like', 'account, explanation', '', 'Please read the job description carefully.', '請仔細閱讀職務說明。'],
  ['efficient', '[ɪˋfɪʃənt]', 'adj.', '有效率的', 'working well without wasting time, money, or energy', 'effective, productive', 'inefficient, wasteful', 'The new system is more efficient.', '新系統更有效率。'],
  ['evaluate', '[ɪˋvæljʊˏet]', 'v.', '評估；評價', 'to judge the quality, value, or importance of something', 'assess, judge', '', 'Managers evaluate employees twice a year.', '主管每年評估員工兩次。'],
  ['exceed', '[ɪkˋsid]', 'v.', '超過', 'to be more than a particular number, amount, or limit', 'surpass, go beyond', 'fall short of', 'Sales exceeded our expectations.', '銷售額超出了我們的預期。'],
  ['headquarters', '[ˋhɛdˋkwɔrtɚz]', 'n.', '總部', 'the main office of an organization', 'head office, main office', 'branch', 'Our headquarters is located in Taipei.', '我們的總部位於台北。'],
  ['incentive', '[ɪnˋsɛntɪv]', 'n.', '獎勵；誘因', 'something that encourages a person to do something', 'motivation, reward', 'disincentive, deterrent', 'Bonuses are an incentive for staff to work harder.', '獎金是激勵員工努力工作的誘因。'],
  ['interview', '[ˋɪntɚˏvju]', 'n./v.', '面試', 'a formal meeting to decide whether someone is suitable for a job', 'meeting, consultation', '', 'I have a job interview tomorrow morning.', '我明天早上有個工作面試。'],
  ['maintenance', '[ˋmentənəns]', 'n.', '維修；保養', 'the work of keeping something in good condition', 'upkeep, repair', 'neglect', 'The elevator is closed for maintenance.', '電梯因維修暫停使用。'],
  ['objective', '[əbˋdʒɛktɪv]', 'n.', '目標', 'something that you plan to achieve', 'goal, aim', '', 'Our main objective is to increase sales.', '我們的主要目標是提高銷售額。'],
  ['occupy', '[ˋɑkjəˏpaɪ]', 'v.', '佔用；使用', 'to use or fill a space, area, or period of time', 'fill, take up', 'vacate, leave', 'Our company occupies the top three floors.', '我們公司佔用頂樓三層。'],
  ['on-site', '[ˋɑnˋsaɪt]', 'adj.', '現場的', 'at the place where the work or activity happens', 'in-house, on-location', 'off-site, remote', 'The factory has an on-site cafeteria.', '工廠內設有員工餐廳。'],
  ['overtime', '[ˋovɚˏtaɪm]', 'n.', '加班', 'time worked beyond your normal working hours', 'extra hours', '', 'I worked two hours of overtime yesterday.', '我昨天加班了兩小時。'],
  ['payroll', '[ˋpeˏrol]', 'n.', '薪資名冊；薪資總額', 'a list of a company’s employees and what they are paid; the total amount paid', 'wages, salaries', '', 'The company has 200 people on its payroll.', '這家公司有 200 名受薪員工。'],
  ['prospective', '[prəˋspɛktɪv]', 'adj.', '潛在的；預期的', 'likely to become something in the future', 'potential, future', 'current, existing', 'We are meeting a prospective client today.', '我們今天要與一位潛在客戶見面。'],
  ['punctual', '[ˋpʌŋktʃʊəl]', 'adj.', '準時的', 'arriving or doing something at the expected time', 'on time, prompt', 'late, tardy', 'Please be punctual for the meeting.', '開會請準時。'],
  ['questionnaire', '[ˏkwɛstʃənˋɛr]', 'n.', '問卷', 'a list of questions used to collect information from people', 'survey, form', '', 'Please fill out this short questionnaire.', '請填寫這份簡短問卷。'],
  ['résumé', '[ˋrɛzəˏme]', 'n.', '履歷', 'a document describing your education and work experience', 'CV', '', 'Please send your résumé to the HR department.', '請將履歷寄到人資部。'],
  ['retirement', '[rɪˋtaɪrmənt]', 'n.', '退休', 'the act of stopping work permanently, usually because of age', '', '', 'He is planning his retirement party.', '他正在籌備自己的退休派對。'],
  ['shareholder', '[ˋʃɛrˏholdɚ]', 'n.', '股東', 'a person who owns shares in a company', 'stockholder, investor', '', 'The shareholders will vote on the proposal.', '股東們將對此提案投票。'],
  ['specification', '[ˏspɛsəfəˋkeʃən]', 'n.', '規格；說明書', 'a detailed description of how something should be made or done', 'requirement, standard', '', "The product was built to the customer's specifications.", '產品依照客戶的規格製造。'],
  ['substantial', '[səbˋstænʃəl]', 'adj.', '大量的；可觀的', 'large in amount, size, or value', 'considerable, significant', 'small, minor', 'The company made a substantial profit this year.', '公司今年獲利可觀。'],
  ['temporary', '[ˋtɛmpəˏrɛrɪ]', 'adj.', '暫時的；臨時的', 'lasting for only a limited period of time', 'short-term, provisional', 'permanent', 'She got a temporary job over the summer.', '她暑假找到一份臨時工作。'],
  ['upcoming', '[ˋʌpˏkʌmɪŋ]', 'adj.', '即將到來的', 'happening soon', 'forthcoming, approaching', 'past', "Don't forget the upcoming training session.", '別忘了即將舉行的培訓課程。'],
  ['utility', '[juˋtɪlətɪ]', 'n.', '公共事業（水電瓦斯）', 'a service such as water, electricity, or gas that is supplied to the public', 'public service', '', 'Utilities are included in the rent.', '房租包含水電瓦斯費。'],
  ['workshop', '[ˋwɝkˏʃɑp]', 'n.', '研討會；工作坊', 'a meeting where people learn about a subject through discussion and practice', 'seminar, training session', '', 'I attended a workshop on time management.', '我參加了一場時間管理工作坊。'],
  ['commute', '[kəˋmjut]', 'v./n.', '通勤', 'to travel regularly between your home and your workplace', 'travel', '', 'My daily commute takes about an hour.', '我每天通勤大約一小時。'],
  ['dispatch', '[dɪˋspætʃ]', 'v.', '派遣；發送', 'to send something or someone somewhere for a purpose', 'send, ship', 'receive', 'Your order will be dispatched within 24 hours.', '您的訂單將在 24 小時內出貨。'],
  ['fluctuate', '[ˋflʌktʃʊˏet]', 'v.', '波動', 'to change often, especially going up and down', 'vary, change', 'stabilize', 'Oil prices fluctuate from week to week.', '油價每週都在波動。'],
  ['forecast', '[ˋforˏkæst]', 'n./v.', '預測', 'a statement about what is expected to happen in the future', 'prediction, projection', '', 'The sales forecast for next year looks positive.', '明年的銷售預測看起來很樂觀。'],
  ['inspect', '[ɪnˋspɛkt]', 'v.', '檢查；視察', 'to look at something carefully in order to check it', 'examine, check', 'overlook', 'Safety officers inspect the factory every month.', '安全人員每月檢查工廠。'],
  ['subsidiary', '[səbˋsɪdɪˏɛrɪ]', 'n.', '子公司', 'a company that is controlled by a larger company', 'affiliate, branch', 'parent company', 'The firm has subsidiaries in five countries.', '這家公司在五個國家設有子公司。'],
  ['surplus', '[ˋsɝpləs]', 'n.', '盈餘；過剩', 'an amount that is more than what is needed or used', 'excess, extra', 'shortage, deficit', 'The company had a budget surplus last year.', '公司去年預算有盈餘。'],
  ['tenant', '[ˋtɛnənt]', 'n.', '房客；承租人', 'a person who pays rent to use a building, room, or land', 'renter, occupant', 'landlord', 'The new tenants move in next week.', '新房客下週搬進來。'],
  ['terminate', '[ˋtɝməˏnet]', 'v.', '終止', 'to end something, such as a contract or agreement', 'end, cancel', 'begin, start', "Either party may terminate the contract with 30 days' notice.", '任一方可於 30 天前通知終止合約。'],
  ['adjacent', '[əˋdʒesənt]', 'adj.', '鄰近的', 'next to or very near something', 'neighboring, next to', 'distant, far', 'The parking lot is adjacent to the building.', '停車場就在大樓旁邊。'],
  ['anticipate', '[ænˋtɪsəˏpet]', 'v.', '預期；期待', 'to expect that something will happen', 'expect, predict', '', 'We anticipate strong demand for the new model.', '我們預期新車款的需求會很強勁。'],
]

const CORE_900 = new Set(
  'reimburse itinerary compliance comprehensive consecutive eligible feasible mandatory preliminary tentative subsidiary adjacent fluctuate complimentary personnel accommodate merger prospective specification substantial terminate enclose surplus audit'.split(' '),
)
const CORE_800 = new Set(
  'distribute estimate facility merchandise negotiate recruit revenue warranty inventory quarterly renovation subscription venue acquire assess assign customize defective enhance implement inquiry notify outstanding qualified reference relocate representative revise transaction valid wholesale considerable evaluate exceed incentive maintenance objective occupy on-site payroll punctual questionnaire shareholder utility dispatch anticipate headquarters brochure applicant expire forecast inspect tenant'.split(' '),
)
const coreLevel = (word: string): Level => (CORE_900.has(word) ? 900 : CORE_800.has(word) ? 800 : 600)

const split = (s: string) => (s ? s.split(', ') : [])

const ALL: [Level, RawWord][] = [
  ...CORE.map(w => [coreLevel(w[0]), w] as [Level, RawWord]),
  ...WORDS_600.map(w => [600, w] as [Level, RawWord]),
  ...WORDS_800.map(w => [800, w] as [Level, RawWord]),
  ...WORDS_900.map(w => [900, w] as [Level, RawWord]),
]

export const WORD_INFO: WordInfo[] = ALL.map(([level, [word, kk, pos, zh, def, syn, ant, ex, exZh]]) => ({
  level,
  word,
  kk,
  pos,
  zh,
  def,
  syn: split(syn),
  ant: split(ant),
  ex,
  exZh,
}))

const BY_WORD = new Map(WORD_INFO.map(w => [w.word.toLowerCase(), w]))

/** 查詢單字資料（不分大小寫），自己新增的卡片若是題庫內的字也查得到。 */
export function lookupWord(word: string): WordInfo | undefined {
  return BY_WORD.get(word.trim().toLowerCase())
}

export const TOEIC_WORDS: Card[] = WORD_INFO.map(w => ({
  id: `toeic-${w.word}`,
  question: w.word,
  answer: `(${w.pos}) ${w.zh}`,
  source: 'toeic',
}))

/** 由字串產生固定的亂數產生器，讓同一天抽到的單字永遠相同。 */
function seededRandom(seed: string) {
  let h = 2166136261
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), h | 1)
    h ^= h + Math.imul(h ^ (h >>> 7), h | 61)
    return ((h ^ (h >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

const LEVEL_OF = new Map(WORD_INFO.map(w => [`toeic-${w.word}`, w.level]))

// ---------- 間隔重複（Leitner 盒子法） ----------

export interface WordStat {
  /** 0 = 不熟，數字越大越熟 */
  box: number
  /** 下次該複習的日期 YYYY-MM-DD */
  due: string
  right: number
  wrong: number
  /** 第一次作答的日期，用來畫學習曲線 */
  first?: string
}

/** 各盒子答對後，隔幾天再複習 */
const BOX_INTERVALS = [1, 2, 4, 7, 15, 30]

export function nextStat(stat: WordStat | undefined, known: boolean, today: string): WordStat {
  const prev = stat ?? { box: 0, due: today, right: 0, wrong: 0, first: today }
  const box = known ? Math.min(prev.box + 1, BOX_INTERVALS.length - 1) : 0
  return {
    first: prev.first,
    box,
    due: addDaysKey(today, known ? BOX_INTERVALS[box] : 1),
    right: prev.right + (known ? 1 : 0),
    wrong: prev.wrong + (known ? 0 : 1),
  }
}

export interface DailyPick {
  ids: string[]
  review: string[]
}

/**
 * 抽出今日單字：
 * 1. 先放到期該複習的字（不熟的優先），最多 reviewMax 個
 * 2. 其餘抽目標分數內還沒學過的新字
 * 3. 新字不夠時，再用其他到期字、最後用全部單字補滿
 * 以日期當亂數種子，同一天重複呼叫結果相同。
 */
export function pickDailyWords(opts: {
  dateKey: string
  learnedIds: Set<string>
  stats: Record<string, WordStat>
  maxLevel: Level
  count?: number
  reviewMax?: number
}): DailyPick {
  const { dateKey, learnedIds, stats, maxLevel, count = 10, reviewMax = 4 } = opts
  const random = seededRandom(dateKey)

  const due = Object.entries(stats)
    .filter(([id, s]) => s.due <= dateKey && LEVEL_OF.has(id))
    .sort(([, a], [, b]) => a.box - b.box || a.due.localeCompare(b.due))
    .map(([id]) => id)

  const review = due.slice(0, reviewMax)
  const fresh = shuffle(
    TOEIC_WORDS.filter(w => !learnedIds.has(w.id) && !(w.id in stats) && (LEVEL_OF.get(w.id) ?? 600) <= maxLevel),
    random,
  ).map(w => w.id)

  const ids = [...review, ...fresh.slice(0, count - review.length)]
  for (const id of due.slice(reviewMax)) {
    if (ids.length >= count) break
    ids.push(id)
    review.push(id)
  }
  if (ids.length < count) {
    const rest = shuffle(TOEIC_WORDS.filter(w => !ids.includes(w.id)), random).map(w => w.id)
    ids.push(...rest.slice(0, count - ids.length))
  }
  return { ids: shuffle(ids, random), review }
}
