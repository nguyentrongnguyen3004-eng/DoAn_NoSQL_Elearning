const { MongoClient, ObjectId } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = 'elearning_nosql';

async function seedNewExams() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    console.log('Connected to MongoDB at', MONGO_URI);
    const db = client.db(DB_NAME);

    // 48 QUESTIONS FOR 6 NEW EXAMS
    const newQuestions = [
      // ==========================================
      // EXAM 5: IELTS Speaking & Listening Lexicon (Band 7.0+)
      // ==========================================
      {
        _id: new ObjectId('670000000000000000000053'),
        subject: 'IELTS Academic',
        topic: 'Listening Signposting & Discourse Markers',
        difficulty: 'MEDIUM',
        content: 'In IELTS Listening Part 4, when the lecturer remarks: "Turning now to the question of environmental conservation...", this phrase serves to:',
        options: [
          { key: 'A', text: 'Summarize the preceding argument' },
          { key: 'B', text: 'Signal a transition to a new main topic' },
          { key: 'C', text: 'Disagree with an established scientific theory' },
          { key: 'D', text: 'Introduce a minor personal anecdote' }
        ],
        correctAnswer: 'B',
        explanation: 'Cụm từ "Turning now to..." là một Signpost Word kinh điển trong IELTS Listening dùng để báo hiệu sự chuyển giao sang luận điểm hoặc chủ đề tiếp theo.'
      },
      {
        _id: new ObjectId('670000000000000000000054'),
        subject: 'IELTS Academic',
        topic: 'Academic Lexical Resource',
        difficulty: 'HARD',
        content: 'Complete the academic sentence: "The municipal government should enact stringent policies to _____ the severe repercussions of environmental pollution."',
        options: [
          { key: 'A', text: 'mitigate' },
          { key: 'B', text: 'exacerbate' },
          { key: 'C', text: 'precipitate' },
          { key: 'D', text: 'disregard' }
        ],
        correctAnswer: 'A',
        explanation: '"Mitigate" (làm giảm nhẹ, xoa dịu tác hại) là động từ học thuật thuộc Academic Word List (AWL) thường dùng trong IELTS Writing & Speaking chủ đề Environment.'
      },
      {
        _id: new ObjectId('670000000000000000000055'),
        subject: 'IELTS Academic',
        topic: 'Speaking Part 3 Idiomatic Expressions',
        difficulty: 'MEDIUM',
        content: 'In IELTS Speaking Part 3, a candidate remarks: "Artificial Intelligence is undeniably a double-edged sword." What does this idiomatic phrase signify?',
        options: [
          { key: 'A', text: 'It is highly hazardous and should be prohibited entirely' },
          { key: 'B', text: 'It only benefits large technology corporations' },
          { key: 'C', text: 'It possesses both significant benefits and potential drawbacks' },
          { key: 'D', text: 'It is an ephemeral trend that will soon disappear' }
        ],
        correctAnswer: 'C',
        explanation: 'Thành ngữ "a double-edged sword" (con dao hai lưỡi) mô tả sự vật/hiện tượng mang cả lợi ích vượt trội lẫn nguy cơ tiềm tàng.'
      },
      {
        _id: new ObjectId('670000000000000000000056'),
        subject: 'IELTS Academic',
        topic: 'Listening Agreement & Stance',
        difficulty: 'EASY',
        content: 'In a Listening conversation, Student A states: "Online education lacks genuine personal interaction." Student B responds: "I couldn\'t agree more." What is Student B\'s stance?',
        options: [
          { key: 'A', text: 'Student B completely agrees with Student A\'s viewpoint' },
          { key: 'B', text: 'Student B strongly opposes Student A' },
          { key: 'C', text: 'Student B feels undecided on the issue' },
          { key: 'D', text: 'Student B prefers virtual classrooms over traditional schools' }
        ],
        correctAnswer: 'A',
        explanation: '"I couldn\'t agree more" mang nghĩa "Tôi hoàn toàn đồng ý", là một cấu trúc bẫy thường gặp trong IELTS Listening Section 3.'
      },
      {
        _id: new ObjectId('670000000000000000000057'),
        subject: 'IELTS Academic',
        topic: 'Urban Planning Lexicon',
        difficulty: 'MEDIUM',
        content: 'Which compound noun refers to the uncontrolled outward expansion of urban areas into surrounding countryside?',
        options: [
          { key: 'A', text: 'Urban congestion' },
          { key: 'B', text: 'Urban regeneration' },
          { key: 'C', text: 'Urban sprawl' },
          { key: 'D', text: 'Urban density' }
        ],
        correctAnswer: 'C',
        explanation: '"Urban sprawl" (sự đô thị hóa tràn lan/vô trật tự) là thuật ngữ học thuật trọng tâm trong IELTS chủ đề Urbanisation & Environment.'
      },
      {
        _id: new ObjectId('670000000000000000000058'),
        subject: 'IELTS Academic',
        topic: 'Speaking Part 2 Describing People',
        difficulty: 'MEDIUM',
        content: 'In IELTS Speaking Part 2, when describing an inspiring figure: "Her _____ dedication to community empowerment earned her national acclaim."',
        options: [
          { key: 'A', text: 'oscillating' },
          { key: 'B', text: 'unwavering' },
          { key: 'C', text: 'superficial' },
          { key: 'D', text: 'reluctant' }
        ],
        correctAnswer: 'B',
        explanation: '"Unwavering dedication" (sự cống hiến không ngừng nghỉ / kiên định) là collocation Band 8.0 trong IELTS Speaking.'
      },
      {
        _id: new ObjectId('670000000000000000000059'),
        subject: 'IELTS Academic',
        topic: 'Listening Distractor Identification',
        difficulty: 'EASY',
        content: 'In IELTS Listening: "The symposium was initially set for Friday; however, due to scheduling conflicts, it has been rescheduled to Tuesday." When will the symposium occur?',
        options: [
          { key: 'A', text: 'Friday' },
          { key: 'B', text: 'Monday' },
          { key: 'C', text: 'Tuesday' },
          { key: 'D', text: 'Wednesday' }
        ],
        correctAnswer: 'C',
        explanation: 'Bẫy tự sửa (Self-correction distractors): Thứ Sáu là ngày dự kiến ban đầu, ngày thực tế diễn ra sau khi đổi là Thứ Ba (Tuesday).'
      },
      {
        _id: new ObjectId('67000000000000000000005a'),
        subject: 'IELTS Academic',
        topic: 'Idiomatic Resource Band 8.0',
        difficulty: 'HARD',
        content: 'Choose the word that best fits: "The hypothesis that bilingualism delays cognitive decline remains a bone of _____ among linguistic researchers."',
        options: [
          { key: 'A', text: 'contention' },
          { key: 'B', text: 'consensus' },
          { key: 'C', text: 'harmony' },
          { key: 'D', text: 'resolution' }
        ],
        correctAnswer: 'A',
        explanation: 'Idiom "a bone of contention" (vấn đề gây tranh cãi, chưa thống nhất) là cụm từ nâng cao rất được giám khảo IELTS đánh giá cao.'
      },

      // ==========================================
      // EXAM 6: Business English & Global Workplace Communication
      // ==========================================
      {
        _id: new ObjectId('67000000000000000000005b'),
        subject: 'Business English',
        topic: 'Email Correspondence & Formality',
        difficulty: 'EASY',
        content: 'In a formal business email: "Please find _____ the financial audit report for Q3 for your detailed review."',
        options: [
          { key: 'A', text: 'attach' },
          { key: 'B', text: 'attached' },
          { key: 'C', text: 'attachment' },
          { key: 'D', text: 'attaching' }
        ],
        correctAnswer: 'B',
        explanation: '"Please find attached + Noun" là cấu trúc chuẩn mực và trang trọng nhất trong thư tín thương mại quốc tế.'
      },
      {
        _id: new ObjectId('67000000000000000000005c'),
        subject: 'Business English',
        topic: 'Commercial Negotiations',
        difficulty: 'MEDIUM',
        content: 'During commercial negotiations, when both parties agree to make mutual concessions to reach a consensus, they are said to:',
        options: [
          { key: 'A', text: 'compromise' },
          { key: 'B', text: 'retaliate' },
          { key: 'C', text: 'boycott' },
          { key: 'D', text: 'procrastinate' }
        ],
        correctAnswer: 'A',
        explanation: '"Compromise" (thỏa hiệp / nhượng bộ lẫn nhau để đạt thỏa thuận) là khái niệm trọng yếu trong đàm phán thương mại.'
      },
      {
        _id: new ObjectId('67000000000000000000005d'),
        subject: 'Business English',
        topic: 'Corporate Idioms & Workplace Register',
        difficulty: 'MEDIUM',
        content: 'In corporate communication, what does the idiom "touch base with the client" mean?',
        options: [
          { key: 'A', text: 'Terminate a commercial contract immediately' },
          { key: 'B', text: 'Send an official legal invoice' },
          { key: 'C', text: 'Briefly contact or meet with the client to update information' },
          { key: 'D', text: 'File a formal complaint against the client' }
        ],
        correctAnswer: 'C',
        explanation: '"Touch base" là thành ngữ công sở phổ biến chỉ việc liên lạc nhanh để cập nhật tình hình công việc.'
      },
      {
        _id: new ObjectId('67000000000000000000005e'),
        subject: 'Business English',
        topic: 'Customer Service & Professional Apologies',
        difficulty: 'EASY',
        content: 'Choose the most professional apology: "We sincerely apologize for any _____ this unexpected server downtime may have caused."',
        options: [
          { key: 'A', text: 'anger' },
          { key: 'B', text: 'awkwardness' },
          { key: 'C', text: 'dispute' },
          { key: 'D', text: 'inconvenience' }
        ],
        correctAnswer: 'D',
        explanation: '"We sincerely apologize for any inconvenience caused" là mẫu câu xin lỗi khách hàng chuẩn mực của các tập đoàn quốc tế.'
      },
      {
        _id: new ObjectId('67000000000000000000005f'),
        subject: 'Business English',
        topic: 'Financial Reporting Terminology',
        difficulty: 'HARD',
        content: '"The board announced that the company\'s operating profit _____ expanded by 4.5% due to effective cost-cutting measures."',
        options: [
          { key: 'A', text: 'debt' },
          { key: 'B', text: 'margin' },
          { key: 'C', text: 'deficit' },
          { key: 'D', text: 'liability' }
        ],
        correctAnswer: 'B',
        explanation: '"Operating profit margin" (biên lợi nhuận hoạt động) là chỉ số tài chính cơ bản trong báo cáo tài chính doanh nghiệp.'
      },
      {
        _id: new ObjectId('670000000000000000000060'),
        subject: 'Business English',
        topic: 'Executive Strategy',
        difficulty: 'MEDIUM',
        content: 'In corporate governance: "Achieving carbon neutrality by 2030 is designated as a top strategic _____ for our organization."',
        options: [
          { key: 'A', text: 'priority' },
          { key: 'B', text: 'drawback' },
          { key: 'C', text: 'compromise' },
          { key: 'D', text: 'obstacle' }
        ],
        correctAnswer: 'A',
        explanation: '"Top strategic priority" (ưu tiên chiến lược hàng đầu) là cụm từ cốt lõi trong báo cáo quản trị và thư gửi cổ đông.'
      },
      {
        _id: new ObjectId('670000000000000000000061'),
        subject: 'Business English',
        topic: 'Logistics & Supply Chain',
        difficulty: 'HARD',
        content: '"Severe port congestion created major logistical _____ that halted production lines for two consecutive weeks."',
        options: [
          { key: 'A', text: 'breakthroughs' },
          { key: 'B', text: 'shortcuts' },
          { key: 'C', text: 'bottlenecks' },
          { key: 'D', text: 'surpluses' }
        ],
        correctAnswer: 'C',
        explanation: '"Bottleneck" (điểm nghẽn cổ chai) chỉ tình trạng tắc nghẽn trong chuỗi cung ứng hoặc quy trình sản xuất.'
      },
      {
        _id: new ObjectId('670000000000000000000062'),
        subject: 'Business English',
        topic: 'Human Resources & Appraisal',
        difficulty: 'MEDIUM',
        content: 'In human resource management: "Key employees who consistently _____ performance expectations are rewarded with stock options."',
        options: [
          { key: 'A', text: 'succumb' },
          { key: 'B', text: 'exceed' },
          { key: 'C', text: 'abandon' },
          { key: 'D', text: 'overlook' }
        ],
        correctAnswer: 'B',
        explanation: '"Exceed performance expectations" (vượt qua kỳ vọng hiệu suất) là tiêu chí đánh giá KPI nhân sự định kỳ.'
      },

      // ==========================================
      // EXAM 7: VSTEP B2 - C1 Định Hướng Sau Đại Học
      // ==========================================
      {
        _id: new ObjectId('670000000000000000000063'),
        subject: 'VSTEP B2-C1',
        topic: 'Academic Vocabulary & Archaic Markers',
        difficulty: 'HARD',
        content: 'In academic research texts, the adverb "hitherto" (e.g. "a hitherto unknown virus strain") most closely means:',
        options: [
          { key: 'A', text: 'periodically' },
          { key: 'B', text: 'previously / up until now' },
          { key: 'C', text: 'unexpectedly' },
          { key: 'D', text: 'universally' }
        ],
        correctAnswer: 'B',
        explanation: '"Hitherto" là phó từ học thuật trang trọng đồng nghĩa với "until now / previously" (cho đến thời điểm này).'
      },
      {
        _id: new ObjectId('670000000000000000000064'),
        subject: 'VSTEP B2-C1',
        topic: 'Advanced Inversion Structures',
        difficulty: 'HARD',
        content: '"Not until all clinical trial data had been verified _____ to commercialize the vaccine."',
        options: [
          { key: 'A', text: 'did the pharmaceutical firm decide' },
          { key: 'B', text: 'the pharmaceutical firm decided' },
          { key: 'C', text: 'has the pharmaceutical firm decided' },
          { key: 'D', text: 'decided the pharmaceutical firm' }
        ],
        correctAnswer: 'A',
        explanation: 'Cấu trúc đảo ngữ: "Not until + Clause/Time + Trợ động từ + S + V" (Mãi cho đến khi... thì mới...).'
      },
      {
        _id: new ObjectId('670000000000000000000065'),
        subject: 'VSTEP B2-C1',
        topic: 'Cleft Sentences for Emphasis',
        difficulty: 'MEDIUM',
        content: 'Which cleft sentence structure correctly emphasizes the subject researcher?',
        options: [
          { key: 'A', text: 'It was Dr. Thorne who introduced the novel statistical methodology.' },
          { key: 'B', text: 'It was Dr. Thorne whom introduced the novel statistical methodology.' },
          { key: 'C', text: 'What Dr. Thorne introduced that the novel statistical methodology.' },
          { key: 'D', text: 'That Dr. Thorne was introduced the novel statistical methodology.' }
        ],
        correctAnswer: 'A',
        explanation: 'Cấu trúc câu chẻ nhấn mạnh chủ ngữ chỉ người: "It + is/was + Subject (person) + who/that + V...".'
      },
      {
        _id: new ObjectId('670000000000000000000066'),
        subject: 'VSTEP B2-C1',
        topic: 'Educational Pedagogy Collocations',
        difficulty: 'MEDIUM',
        content: 'Complete the sentence: "Modern pedagogy strongly discourages _____ learning, urging educators to cultivate analytical thinking instead."',
        options: [
          { key: 'A', text: 'spontaneous' },
          { key: 'B', text: 'empirical' },
          { key: 'C', text: 'holistic' },
          { key: 'D', text: 'rote' }
        ],
        correctAnswer: 'D',
        explanation: '"Rote learning" (học vẹt, ghi nhớ máy móc) là cụm từ trái nghĩa với "analytical thinking / creative thinking" trong giáo dục học.'
      },
      {
        _id: new ObjectId('670000000000000000000067'),
        subject: 'VSTEP B2-C1',
        topic: 'Mixed Conditionals (Type 3 + Type 2)',
        difficulty: 'HARD',
        content: 'Mixed Conditional: "If the government had invested heavily in solar power a decade ago, our country _____ energy self-sufficient today."',
        options: [
          { key: 'A', text: 'will be' },
          { key: 'B', text: 'would be' },
          { key: 'C', text: 'would have been' },
          { key: 'D', text: 'had been' }
        ],
        correctAnswer: 'B',
        explanation: 'Câu điều kiện kết hợp (Mixed Conditional): Giả thiết quá khứ (had invested) để lại kết quả ở hiện tại (today -> would be).'
      },
      {
        _id: new ObjectId('670000000000000000000068'),
        subject: 'VSTEP B2-C1',
        topic: 'Academic Synonyms',
        difficulty: 'MEDIUM',
        content: 'In scientific literature, "an exhaustive study" is closest in meaning to:',
        options: [
          { key: 'A', text: 'a thorough and comprehensive study' },
          { key: 'B', text: 'a tiring and tedious study' },
          { key: 'C', text: 'a brief and preliminary study' },
          { key: 'D', text: 'an incomplete and biased study' }
        ],
        correctAnswer: 'A',
        explanation: '"Exhaustive" nghĩa là thấu đáo, toàn diện, khảo sát mọi khía cạnh (thorough), khác với "exhausting" (gây mệt mỏi).'
      },
      {
        _id: new ObjectId('670000000000000000000069'),
        subject: 'VSTEP B2-C1',
        topic: 'Subjunctive Mood',
        difficulty: 'MEDIUM',
        content: 'Subjunctive Mood: "The advisory committee recommended that the draft regulation _____ to a national referendum."',
        options: [
          { key: 'A', text: 'is submitted' },
          { key: 'B', text: 'was submitted' },
          { key: 'C', text: 'be submitted' },
          { key: 'D', text: 'submitting' }
        ],
        correctAnswer: 'C',
        explanation: 'Thể giả định (Subjunctive Mood): "Recommend that + S + (should) be + V3/ed".'
      },
      {
        _id: new ObjectId('67000000000000000000006a'),
        subject: 'VSTEP B2-C1',
        topic: 'Discourse Cohesion',
        difficulty: 'MEDIUM',
        content: 'Discourse Marker: "Raw materials have skyrocketed in price; _____, consumer electronics manufacturers must adjust their retail pricing."',
        options: [
          { key: 'A', text: 'consequently' },
          { key: 'B', text: 'notwithstanding' },
          { key: 'C', text: 'conversely' },
          { key: 'D', text: 'whereas' }
        ],
        correctAnswer: 'A',
        explanation: '"Consequently" (kết quả là, do đó) dùng để nối mối quan hệ nguyên nhân - kết quả trong văn bản học thuật.'
      },

      // ==========================================
      // EXAM 8: Academic Collocations & Common Phrasal Verbs
      // ==========================================
      {
        _id: new ObjectId('67000000000000000000006b'),
        subject: 'English Fluency',
        topic: 'Verb-Noun Collocations',
        difficulty: 'EASY',
        content: 'Which verb collocates correctly with "light" to mean "make something easier to understand or reveal new information"?',
        options: [
          { key: 'A', text: 'give' },
          { key: 'B', text: 'shed' },
          { key: 'C', text: 'make' },
          { key: 'D', text: 'push' }
        ],
        correctAnswer: 'B',
        explanation: '"Shed light on something" (làm sáng tỏ / làm rõ chân tướng một vấn đề) là collocation học thuật phổ biến.'
      },
      {
        _id: new ObjectId('67000000000000000000006c'),
        subject: 'English Fluency',
        topic: 'Phrasal Verbs (Cause & Effect)',
        difficulty: 'MEDIUM',
        content: '"The rapid integration of machine learning has _____ about monumental shifts in medical diagnostics."',
        options: [
          { key: 'A', text: 'brought' },
          { key: 'B', text: 'looked' },
          { key: 'C', text: 'taken' },
          { key: 'D', text: 'put' }
        ],
        correctAnswer: 'A',
        explanation: '"Bring about" (dẫn đến, mang lại, gây ra biến đổi) = cause to happen.'
      },
      {
        _id: new ObjectId('67000000000000000000006d'),
        subject: 'English Fluency',
        topic: 'Adjective-Noun Collocations',
        difficulty: 'HARD',
        content: 'Which adjective forms a strong collocation with "danger" or "threat" to mean very serious?',
        options: [
          { key: 'A', text: 'profound' },
          { key: 'B', text: 'massive' },
          { key: 'C', text: 'grave' },
          { key: 'D', text: 'heavy' }
        ],
        correctAnswer: 'C',
        explanation: '"Grave danger / grave threat" (mối nguy hiểm nghiêm trọng, đe dọa sinh tử) là collocation cố định chuẩn ngữ bản xứ.'
      },
      {
        _id: new ObjectId('67000000000000000000006e'),
        subject: 'English Fluency',
        topic: 'Idiomatic Expressions',
        difficulty: 'MEDIUM',
        content: 'The political leaders finally agreed to "bury the hatchet". What did they do?',
        options: [
          { key: 'A', text: 'Conceal a weapon in a secret location' },
          { key: 'B', text: 'Ratify an emergency trade embargo' },
          { key: 'C', text: 'Postpone general elections indefinitely' },
          { key: 'D', text: 'End their longstanding feud and make peace' }
        ],
        correctAnswer: 'D',
        explanation: '"Bury the hatchet" (chôn chiếc rìu chiến = giải hòa, làm hòa sau tranh chấp lâu năm).'
      },
      {
        _id: new ObjectId('67000000000000000000006f'),
        subject: 'English Fluency',
        topic: 'Phrasal Verbs (Eliminate)',
        difficulty: 'MEDIUM',
        content: '"The municipal council decided to _____ away with the obsolete paper permit system and launch a mobile app."',
        options: [
          { key: 'A', text: 'get' },
          { key: 'B', text: 'do' },
          { key: 'C', text: 'take' },
          { key: 'D', text: 'run' }
        ],
        correctAnswer: 'B',
        explanation: '"Do away with" = eliminate, abolish (loại bỏ, bãi bỏ thủ tục lạc hậu).'
      },
      {
        _id: new ObjectId('670000000000000000000070'),
        subject: 'English Fluency',
        topic: 'Collocation with "Conclusion"',
        difficulty: 'EASY',
        content: 'Which verb correctly collocates with "conclusion" in the sense of reaching a deduction based on evidence?',
        options: [
          { key: 'A', text: 'draw' },
          { key: 'B', text: 'paint' },
          { key: 'C', text: 'build' },
          { key: 'D', text: 'write' }
        ],
        correctAnswer: 'A',
        explanation: '"Draw a conclusion" (rút ra kết luận dựa trên chứng cứ dữ liệu).'
      },
      {
        _id: new ObjectId('670000000000000000000071'),
        subject: 'English Fluency',
        topic: 'Phrasal Verbs & Idioms',
        difficulty: 'MEDIUM',
        content: '"The unexpected resignation of the managing director _____ the entire executive board off balance."',
        options: [
          { key: 'A', text: 'sent' },
          { key: 'B', text: 'made' },
          { key: 'C', text: 'threw' },
          { key: 'D', text: 'carried' }
        ],
        correctAnswer: 'C',
        explanation: '"Throw someone off balance" (khiến ai đó bị bất ngờ, lúng túng, mất thăng bằng).'
      },
      {
        _id: new ObjectId('670000000000000000000072'),
        subject: 'English Fluency',
        topic: 'Collocations with "Role"',
        difficulty: 'HARD',
        content: 'Which adjective collocates with "role" to signify central, indispensable importance?',
        options: [
          { key: 'A', text: 'nominal' },
          { key: 'B', text: 'minor' },
          { key: 'C', text: 'peripheral' },
          { key: 'D', text: 'pivotal' }
        ],
        correctAnswer: 'D',
        explanation: '"Play a pivotal role in..." (đóng vai trò nòng cốt, then chốt, mang tính quyết định).'
      },

      // ==========================================
      // EXAM 9: Ngữ Âm, Trọng Âm & Quy Tắc Nối Âm Chuẩn Quốc Tế
      // ==========================================
      {
        _id: new ObjectId('670000000000000000000073'),
        subject: 'Phonetics & Phonology',
        topic: 'Two-Syllable Word Stress (Noun vs Verb)',
        difficulty: 'EASY',
        content: 'Which two-syllable word has its primary stress placed on the FIRST syllable?',
        options: [
          { key: 'A', text: '\'record (noun)' },
          { key: 'B', text: 'de\'cide (verb)' },
          { key: 'C', text: 'a\'gree (verb)' },
          { key: 'D', text: 'con\'sent (verb)' }
        ],
        correctAnswer: 'A',
        explanation: 'Quy tắc trọng âm: danh từ 2 âm tiết thường nhấn âm 1 (\'record /ˈrek.ɔːd/), động từ thường nhấn âm 2 (re\'cord, de\'cide, a\'gree).'
      },
      {
        _id: new ObjectId('670000000000000000000074'),
        subject: 'Phonetics & Phonology',
        topic: 'Pronunciation of -ed Suffix',
        difficulty: 'EASY',
        content: 'In which word is the past tense ending "-ed" pronounced as /t/?',
        options: [
          { key: 'A', text: 'laughed' },
          { key: 'B', text: 'played' },
          { key: 'C', text: 'wanted' },
          { key: 'D', text: 'begged' }
        ],
        correctAnswer: 'A',
        explanation: 'Đuôi \'-ed\' phát âm là /t/ sau các âm vô thanh như /f/ (laughed /lɑːft/, /k/, /s/, /ʃ/, /tʃ/, /p/).'
      },
      {
        _id: new ObjectId('670000000000000000000075'),
        subject: 'Phonetics & Phonology',
        topic: 'Vowel Contrasts (/i:/ vs /e/)',
        difficulty: 'MEDIUM',
        content: 'Which word has the vowel sound pronounced differently from the others?',
        options: [
          { key: 'A', text: 'breathe (vowel /iː/)' },
          { key: 'B', text: 'bread (vowel /e/)' },
          { key: 'C', text: 'head (vowel /e/)' },
          { key: 'D', text: 'feather (vowel /e/)' }
        ],
        correctAnswer: 'A',
        explanation: '"breathe" phát âm với nguyên âm dài /iː/ (/briːð/), trong khi bread, head, feather phát âm với nguyên âm ngắn /e/.'
      },
      {
        _id: new ObjectId('670000000000000000000076'),
        subject: 'Phonetics & Phonology',
        topic: 'Multi-Syllable Stress Patterns',
        difficulty: 'MEDIUM',
        content: 'Identify the word that exhibits a different stress position from the rest:',
        options: [
          { key: 'A', text: '\'photograph (1st)' },
          { key: 'B', text: 'pho\'tography (2nd)' },
          { key: 'C', text: 'de\'velopment (2nd)' },
          { key: 'D', text: 'oc\'currence (2nd)' }
        ],
        correctAnswer: 'A',
        explanation: '\'photograph nhấn âm 1; pho\'tography, de\'velopment, oc\'currence đều nhấn âm 2.'
      },
      {
        _id: new ObjectId('670000000000000000000077'),
        subject: 'Phonetics & Phonology',
        topic: 'Pronunciation of -s/-es Suffix',
        difficulty: 'EASY',
        content: 'In which word is the plural "-s / -es" suffix pronounced as /ɪz/?',
        options: [
          { key: 'A', text: 'churches' },
          { key: 'B', text: 'books' },
          { key: 'C', text: 'roads' },
          { key: 'D', text: 'pens' }
        ],
        correctAnswer: 'A',
        explanation: 'Đuôi \'-s/-es\' phát âm là /ɪz/ sau các âm xuýt (sibilants): /s, z, ʃ, ʒ, tʃ, dʒ/ (churches /ˈtʃɜː.tʃɪz/).'
      },
      {
        _id: new ObjectId('670000000000000000000078'),
        subject: 'Phonetics & Phonology',
        topic: 'Connected Speech: Elision',
        difficulty: 'HARD',
        content: 'In fluent connected speech, why is "next day" frequently articulated as /neks deɪ/?',
        options: [
          { key: 'A', text: 'Assimilation of voice' },
          { key: 'B', text: 'Elision (omission) of the alveolar plosive /t/ between consonants' },
          { key: 'C', text: 'Insertion of an intrusive vowel' },
          { key: 'D', text: 'Glottal stop replacement' }
        ],
        correctAnswer: 'B',
        explanation: 'Hiện tượng nuốt âm (Elision): âm /t/ bị lược bỏ khi đứng giữa hai phụ âm khác (/kst d/ -> /ks d/).'
      },
      {
        _id: new ObjectId('670000000000000000000079'),
        subject: 'Phonetics & Phonology',
        topic: 'Connected Speech: Linking /w/',
        difficulty: 'HARD',
        content: 'When transitioning smoothly between "two apples" in standard English speech, which gliding sound naturally connects the words?',
        options: [
          { key: 'A', text: '/j/' },
          { key: 'B', text: '/w/' },
          { key: 'C', text: '/r/' },
          { key: 'D', text: '/l/' }
        ],
        correctAnswer: 'B',
        explanation: 'Hiện tượng nối âm bán nguyên âm (Linking /w/): khi một từ kết thúc bằng nguyên âm tròn môi (/uː/, /oʊ/) và từ kế bắt đầu bằng nguyên âm, âm lướt /w/ được chèn vào ("two /w/ apples").'
      },
      {
        _id: new ObjectId('67000000000000000000007a'),
        subject: 'Phonetics & Phonology',
        topic: 'Compound Noun Stress',
        difficulty: 'MEDIUM',
        content: 'Where is the primary lexical stress placed in the compound noun "greenhouse" (nhà kính trồng hoa)?',
        options: [
          { key: 'A', text: 'On the first word \'green\'' },
          { key: 'B', text: 'On the second word \'house\'' },
          { key: 'C', text: 'Equally stressed on both words' },
          { key: 'D', text: 'Alternating depending on sentence rhythm' }
        ],
        correctAnswer: 'A',
        explanation: 'Quy tắc trọng âm danh từ ghép (Compound Noun): trọng âm chính rơi vào từ thứ nhất (\'greenhouse /ˈɡriːn.haʊs/).'
      },

      // ==========================================
      // EXAM 10: SAT / GRE Advanced Lexical Reasoning
      // ==========================================
      {
        _id: new ObjectId('67000000000000000000007b'),
        subject: 'SAT / GRE Verbal',
        topic: 'Text Completion & Nuance',
        difficulty: 'HARD',
        content: '"The diplomat was known for giving _____ statements that permitted varying interpretations, thus circumventing direct confrontation."',
        options: [
          { key: 'A', text: 'lucid' },
          { key: 'B', text: 'equivocal' },
          { key: 'C', text: 'candid' },
          { key: 'D', text: 'resolute' }
        ],
        correctAnswer: 'B',
        explanation: '"Equivocal" (nhập nhằng, nước đôi, đa nghĩa) = ambiguous, allowing multiple interpretations to evade commitment.'
      },
      {
        _id: new ObjectId('67000000000000000000007c'),
        subject: 'SAT / GRE Verbal',
        topic: 'Sentence Equivalence',
        difficulty: 'HARD',
        content: '"Though surrounded by luxury, the scholar retained an austere and _____ lifestyle, eschewing modern conveniences."',
        options: [
          { key: 'A', text: 'frugal' },
          { key: 'B', text: 'profligate' },
          { key: 'C', text: 'opulent' },
          { key: 'D', text: 'ostentatious' }
        ],
        correctAnswer: 'A',
        explanation: '"Frugal" (thanh đạm, tiết kiệm) đi liền với "austere" và đối nghịch với "profligate" (hoang phí) hay "opulent" (xa hoa).'
      },
      {
        _id: new ObjectId('67000000000000000000007d'),
        subject: 'SAT / GRE Verbal',
        topic: 'Critical Reasoning & Consistency',
        difficulty: 'HARD',
        content: '"The experimental results were completely _____ with prevailing thermodynamic theory, prompting widespread skepticism."',
        options: [
          { key: 'A', text: 'commensurate' },
          { key: 'B', text: 'congruent' },
          { key: 'C', text: 'incongruous' },
          { key: 'D', text: 'harmonious' }
        ],
        correctAnswer: 'C',
        explanation: '"Incongruous with" (không tương thích, mâu thuẫn sâu sắc) = inconsistent, incompatible.'
      },
      {
        _id: new ObjectId('67000000000000000000007e'),
        subject: 'SAT / GRE Verbal',
        topic: 'Advanced Lexical Precision',
        difficulty: 'HARD',
        content: 'Which word denotes extreme conciseness and brevity of speech or expression?',
        options: [
          { key: 'A', text: 'Verbosity' },
          { key: 'B', text: 'Loquacity' },
          { key: 'C', text: 'Grandiloquence' },
          { key: 'D', text: 'Laconicism' }
        ],
        correctAnswer: 'D',
        explanation: '"Laconicism" (tính ngắn gọn súc tích, ít lời nhưng ý tứ sâu xa) xuất phát từ vùng Laconia (Sparta cổ đại).'
      },
      {
        _id: new ObjectId('67000000000000000000007f'),
        subject: 'SAT / GRE Verbal',
        topic: 'Antonym & Tone Analysis',
        difficulty: 'HARD',
        content: 'The antonym of "laudatory" (expressing high praise) in an academic critical context is:',
        options: [
          { key: 'A', text: 'disparaging' },
          { key: 'B', text: 'adulatory' },
          { key: 'C', text: 'complimentary' },
          { key: 'D', text: 'eulogistic' }
        ],
        correctAnswer: 'A',
        explanation: '"Laudatory" (khen ngợi, tán dương) đối lập hoàn toàn với "disparaging" (gièm pha, chê bai, hạ thấp giá trị).'
      },
      {
        _id: new ObjectId('670000000000000000000080'),
        subject: 'SAT / GRE Verbal',
        topic: 'Epistemology & Logic',
        difficulty: 'MEDIUM',
        content: 'In critical reasoning, confusing temporal sequence with causal relationship (post hoc ergo propter hoc) is a prime example of a logical:',
        options: [
          { key: 'A', text: 'premise' },
          { key: 'B', text: 'fallacy' },
          { key: 'C', text: 'syllogism' },
          { key: 'D', text: 'axiom' }
        ],
        correctAnswer: 'B',
        explanation: '"Logical fallacy" (ngụy biện logic) chỉ các lỗi lập luận sai lầm về mặt logic dù bề ngoài có vẻ thuyết phục.'
      },
      {
        _id: new ObjectId('670000000000000000000081'),
        subject: 'SAT / GRE Verbal',
        topic: 'Contextual Tone & Composure',
        difficulty: 'HARD',
        content: '"Despite immense pressure from the market downturn, the CEO presided over the crisis with remarkable calmness and _____."',
        options: [
          { key: 'A', text: 'agitation' },
          { key: 'B', text: 'petulance' },
          { key: 'C', text: 'equanimity' },
          { key: 'D', text: 'trepidation' }
        ],
        correctAnswer: 'C',
        explanation: '"Equanimity" (sự điềm tĩnh, thanh thản trước nghịch cảnh) là từ vựng GRE mức độ 99th percentile.'
      },
      {
        _id: new ObjectId('670000000000000000000082'),
        subject: 'SAT / GRE Verbal',
        topic: 'Nuance & Transience',
        difficulty: 'MEDIUM',
        content: '"Social media virality is inherently _____; sensational posts generate intense engagement for hours before fading into oblivion."',
        options: [
          { key: 'A', text: 'enduring' },
          { key: 'B', text: 'immutable' },
          { key: 'C', text: 'perpetual' },
          { key: 'D', text: 'ephemeral' }
        ],
        correctAnswer: 'D',
        explanation: '"Ephemeral" (phù du, sớm nở tối tàn, chỉ kéo dài trong khoảnh khắc ngắn ngủi) = fleeting, short-lived.'
      }
    ];

    console.log('Upserting 48 new questions into MongoDB...');
    for (const q of newQuestions) {
      await db.collection('questions').updateOne(
        { _id: q._id },
        { $set: q },
        { upsert: true }
      );
    }
    console.log('Successfully upserted 48 questions.');

    // 6 NEW EXAM DEFINITIONS
    const newExams = [
      {
        _id: new ObjectId('67000000000000000000004d'),
        title: 'IELTS Speaking & Listening: Academic Lexical Resource & Signposting Band 7.0+',
        courseId: new ObjectId('670000000000000000000010'),
        durationMinutes: 20,
        totalQuestions: 8,
        questions: [
          new ObjectId('670000000000000000000053'),
          new ObjectId('670000000000000000000054'),
          new ObjectId('670000000000000000000055'),
          new ObjectId('670000000000000000000056'),
          new ObjectId('670000000000000000000057'),
          new ObjectId('670000000000000000000058'),
          new ObjectId('670000000000000000000059'),
          new ObjectId('67000000000000000000005a')
        ],
        startTime: new Date('2026-10-01T08:00:00Z'),
        endTime: new Date('2026-12-30T17:00:00Z'),
        status: 'PUBLISHED',
        category: 'ielts_speaking_listening'
      },
      {
        _id: new ObjectId('67000000000000000000004e'),
        title: 'Business English: Giao Tiếp, Thuyết Trình & Thư Tín Thương Mại Quốc Tế',
        courseId: new ObjectId('670000000000000000000010'),
        durationMinutes: 20,
        totalQuestions: 8,
        questions: [
          new ObjectId('67000000000000000000005b'),
          new ObjectId('67000000000000000000005c'),
          new ObjectId('67000000000000000000005d'),
          new ObjectId('67000000000000000000005e'),
          new ObjectId('67000000000000000000005f'),
          new ObjectId('670000000000000000000060'),
          new ObjectId('670000000000000000000061'),
          new ObjectId('670000000000000000000062')
        ],
        startTime: new Date('2026-10-01T08:00:00Z'),
        endTime: new Date('2026-12-30T17:00:00Z'),
        status: 'PUBLISHED',
        category: 'business_english'
      },
      {
        _id: new ObjectId('67000000000000000000004f'),
        title: 'VSTEP B2 - C1: Đọc Hiểu Học Thuật & Ngữ Pháp Ứng Dụng Sau Đại Học',
        courseId: new ObjectId('670000000000000000000010'),
        durationMinutes: 25,
        totalQuestions: 8,
        questions: [
          new ObjectId('670000000000000000000063'),
          new ObjectId('670000000000000000000064'),
          new ObjectId('670000000000000000000065'),
          new ObjectId('670000000000000000000066'),
          new ObjectId('670000000000000000000067'),
          new ObjectId('670000000000000000000068'),
          new ObjectId('670000000000000000000069'),
          new ObjectId('67000000000000000000006a')
        ],
        startTime: new Date('2026-10-01T08:00:00Z'),
        endTime: new Date('2026-12-30T17:00:00Z'),
        status: 'PUBLISHED',
        category: 'vstep'
      },
      {
        _id: new ObjectId('670000000000000000000050'),
        title: 'Cụm Từ Cố Định & Cụm Động Từ Bản Xứ (Collocations & Phrasal Verbs Mastery)',
        courseId: new ObjectId('670000000000000000000010'),
        durationMinutes: 15,
        totalQuestions: 8,
        questions: [
          new ObjectId('67000000000000000000006b'),
          new ObjectId('67000000000000000000006c'),
          new ObjectId('67000000000000000000006d'),
          new ObjectId('67000000000000000000006e'),
          new ObjectId('67000000000000000000006f'),
          new ObjectId('670000000000000000000070'),
          new ObjectId('670000000000000000000071'),
          new ObjectId('670000000000000000000072')
        ],
        startTime: new Date('2026-10-01T08:00:00Z'),
        endTime: new Date('2026-12-30T17:00:00Z'),
        status: 'PUBLISHED',
        category: 'collocations'
      },
      {
        _id: new ObjectId('670000000000000000000051'),
        title: 'Ngữ Âm IPA, Quy Tắc Trọng Âm & Connected Speech (Phonetics Mastery)',
        courseId: new ObjectId('670000000000000000000010'),
        durationMinutes: 15,
        totalQuestions: 8,
        questions: [
          new ObjectId('670000000000000000000073'),
          new ObjectId('670000000000000000000074'),
          new ObjectId('670000000000000000000075'),
          new ObjectId('670000000000000000000076'),
          new ObjectId('670000000000000000000077'),
          new ObjectId('670000000000000000000078'),
          new ObjectId('670000000000000000000079'),
          new ObjectId('67000000000000000000007a')
        ],
        startTime: new Date('2026-10-01T08:00:00Z'),
        endTime: new Date('2026-12-30T17:00:00Z'),
        status: 'PUBLISHED',
        category: 'phonetics'
      },
      {
        _id: new ObjectId('670000000000000000000052'),
        title: 'SAT / GRE Advanced Lexical Reasoning: Tư Duy Phản Biện & Từ Vựng Cực Khó',
        courseId: new ObjectId('670000000000000000000010'),
        durationMinutes: 25,
        totalQuestions: 8,
        questions: [
          new ObjectId('67000000000000000000007b'),
          new ObjectId('67000000000000000000007c'),
          new ObjectId('67000000000000000000007d'),
          new ObjectId('67000000000000000000007e'),
          new ObjectId('67000000000000000000007f'),
          new ObjectId('670000000000000000000080'),
          new ObjectId('670000000000000000000081'),
          new ObjectId('670000000000000000000082')
        ],
        startTime: new Date('2026-10-01T08:00:00Z'),
        endTime: new Date('2026-12-30T17:00:00Z'),
        status: 'PUBLISHED',
        category: 'sat_gre'
      }
    ];

    console.log('Upserting 6 new exams into MongoDB...');
    for (const ex of newExams) {
      await db.collection('exams').updateOne(
        { _id: ex._id },
        { $set: ex },
        { upsert: true }
      );
    }
    console.log('Successfully upserted 6 exams.');

    const totalExams = await db.collection('exams').countDocuments();
    const totalQuestions = await db.collection('questions').countDocuments();
    console.log(`Summary: Total exams in DB = ${totalExams}, Total questions in DB = ${totalQuestions}`);

  } catch (err) {
    console.error('Error during seeding:', err);
  } finally {
    await client.close();
  }
}

seedNewExams();
