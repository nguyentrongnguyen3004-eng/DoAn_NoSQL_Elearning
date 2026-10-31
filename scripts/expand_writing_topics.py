# -*- coding: utf-8 -*-
"""
Script to expand IELTS Writing Task 2 topics from 3 to 15 (grouped into 5 categories)
and expand Speaking sentences from 3 to 8, with full Band 8.0 essays and live prompt preview.
"""

import os
import re

INDEX_PATH = r"01_Source_Code_EduPro/public/index.html"
STUDY_JS_PATH = r"01_Source_Code_EduPro/public/js/study.js"

# 1. Update index.html
with open(INDEX_PATH, "r", encoding="utf-8") as f:
    html_content = f.read()

# Replace the Writing Select
old_writing_select_pattern = re.compile(
    r'<select id="writing-topic-select"[^>]*>.*?</select>',
    re.DOTALL
)

new_writing_select_block = """<div class="flex items-center justify-between mb-1.5">
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">Chọn chủ đề IELTS Writing Task 2 (15 đề chuẩn Cambridge):</label>
                <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">5 Nhóm Chủ Đề • 15 Đề Thi</span>
              </div>
              <select id="writing-topic-select" onchange="onWritingTopicChange()" class="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-brand-500">
                <optgroup label="📚 NHÓM 1: GIÁO DỤC, CÔNG NGHỆ & TRÍ TUỆ NHÂN TẠO (AI)">
                  <option value="Some people believe that artificial intelligence and online platforms will replace traditional classrooms and teachers in the near future. To what extent do you agree or disagree?">Chủ đề 1 (Education & AI): Online platforms & AI replacing traditional classrooms — Agree or Disagree?</option>
                  <option value="Some people think that university education should be free for all students, while others believe students should pay tuition fees since they benefit individually. Discuss both views and give your opinion.">Chủ đề 2 (Higher Education): Free university tuition vs. Self-funded tuition — Discuss both views.</option>
                  <option value="Children are spending an increasing amount of time using digital screens and smartphones for study and leisure. Is this a positive or negative development?">Chủ đề 3 (Child Development): Screen time and digital devices for children — Positive or Negative?</option>
                </optgroup>

                <optgroup label="🌿 NHÓM 2: MÔI TRƯỜNG & PHÁT TRIỂN BỀN VỮNG">
                  <option value="Governments worldwide should prioritize economic growth even if it leads to environmental damage. Discuss both views and give your opinion.">Chủ đề 4 (Environment & Economy): Economic growth vs. Environmental protection — Discuss both views.</option>
                  <option value="Many scientists argue that individual lifestyle changes are insufficient to combat climate change, and only strict government environmental regulations can succeed. To what extent do you agree or disagree?">Chủ đề 5 (Climate Action): Individual lifestyle changes vs. Strict government legislation — Agree or Disagree?</option>
                  <option value="Some countries are transitioning from fossil fuels to renewable energy sources such as solar and wind. Do the advantages of this transition outweigh the disadvantages?">Chủ đề 6 (Renewable Energy): Phasing out fossil fuels for clean green energy — Advantages outweigh Disadvantages?</option>
                </optgroup>

                <optgroup label="💼 NHÓM 3: TOÀN CẦU HÓA, LAO ĐỘNG & VIỆC LÀM">
                  <option value="Many multinational corporations require employees to possess certified English proficiency. Why is this happening, and is it a positive or negative development?">Chủ đề 7 (Globalization & Work): English proficiency in multinational corporations — Positive or Negative?</option>
                  <option value="Remote working and telecommuting from home have become widespread across many corporate sectors. Do the benefits of working from home outweigh the drawbacks?">Chủ đề 8 (Modern Workforce): Remote working from home — Advantages outweigh Disadvantages?</option>
                  <option value="Rapid advances in automation and artificial intelligence are threatening both manual and white-collar jobs. What problems does this cause, and what solutions can governments propose?">Chủ đề 9 (AI & Employment): Technological unemployment and labor automation — Problems & Solutions.</option>
                </optgroup>

                <optgroup label="🏥 NHÓM 4: SỨC KHỎE CỘNG ĐỒNG, LỐI SỐNG & ĐÔ THỊ HÓA">
                  <option value="The rate of obesity and lifestyle-related diseases is increasing worldwide. Some believe governments should impose heavy taxes on fast food and sugary drinks to encourage healthier diets. To what extent do you agree or disagree?">Chủ đề 10 (Public Health): Sugar and junk food taxation to combat obesity — Agree or Disagree?</option>
                  <option value="Rapid urbanization has caused traffic congestion, air pollution, and housing shortages in megacities. What are the main causes, and what urban planning measures can resolve these issues?">Chủ đề 11 (Urban Planning): Megacity congestion and housing shortages — Causes & Solutions.</option>
                  <option value="The widespread use of social media platforms has led to rising anxiety, depression, and social isolation among adolescents. What factors contribute to this, and how can society address it?">Chủ đề 12 (Mental Health): Social media addiction and youth mental health — Causes & Solutions.</option>
                </optgroup>

                <optgroup label="🏛️ NHÓM 5: VĂN HÓA, PHÁP LUẬT & TRÁCH NHIỆM XÃ HỘI">
                  <option value="Some argue that government budgets should be spent on preserving historical monuments and cultural heritage, while others think money is better spent on modern public services like hospitals. Discuss both views and give your opinion.">Chủ đề 13 (Cultural Heritage): Preserving historical heritage vs. Modern public services — Discuss both views.</option>
                  <option value="Some believe that harsher prison sentences are the most effective deterrent to crime, while others argue that education and vocational rehabilitation are far more effective. Discuss both views and give your opinion.">Chủ đề 14 (Crime & Punishment): Incarceration vs. Education & Vocational rehabilitation — Discuss both views.</option>
                  <option value="Modern advertising creates artificial consumer needs and promotes an unsustainable culture of materialistic consumerism. To what extent do you agree or disagree?">Chủ đề 15 (Consumerism & Ads): Commercial advertising manipulating consumer behavior — Agree or Disagree?</option>
                </optgroup>
              </select>
            </div>

            <!-- Thẻ hiển thị Đề bài chi tiết & Dạng bài chuẩn Cambridge -->
            <div id="writing-topic-preview-card" class="p-3.5 rounded-2xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/60 text-xs space-y-1.5 transition-all">
              <div class="flex items-center justify-between">
                <span class="font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider text-[11px]"><i class="fa-solid fa-quote-left mr-1"></i> Đề bài chính thức (IELTS Prompt)</span>
                <span id="writing-topic-type-badge" class="px-2.5 py-0.5 rounded-full font-bold bg-purple-200/80 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-[10px]">Opinion (Agree/Disagree)</span>
              </div>
              <p id="writing-topic-full-text" class="text-slate-700 dark:text-slate-300 italic leading-relaxed">
                "Some people believe that artificial intelligence and online platforms will replace traditional classrooms and teachers in the near future. To what extent do you agree or disagree?"
              </p>
              <div class="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-purple-200/40 dark:border-purple-800/40">
                <i class="fa-solid fa-lightbulb text-amber-500"></i>
                <span id="writing-topic-tip">Cấu trúc khuyến nghị: 4 đoạn (Mở bài ➔ 2 Thân bài phản biện/bổ trợ ➔ Kết luận khẳng định quan điểm).</span>
              </div>"""

# Replace the label and select block
old_block_pattern = re.compile(
    r'<label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1\.5">Chọn chủ đề IELTS Writing Task 2:</label>\s*<select id="writing-topic-select"[^>]*>.*?</select>',
    re.DOTALL
)

if old_block_pattern.search(html_content):
    html_content = old_block_pattern.sub(new_writing_select_block, html_content, count=1)
    print("✓ Đã cập nhật 15 chủ đề Writing Task 2 vào index.html")
else:
    print("⚠ Không tìm thấy khối writing select cũ trong index.html")

# Also expand Speaking Select in index.html
old_speaking_select = """<select id="speaking-sentence-select" onchange="changeSpeakingSentence(this.value)" class="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none">
            <option value="0">Câu mẫu 1: IELTS Speaking Part 3 (Technology & Education)</option>
            <option value="1">Câu mẫu 2: Business English Pitching (Corporate Strategy)</option>
            <option value="2">Câu mẫu 3: IELTS Speaking Part 2 (Memorable Achievement)</option>
          </select>"""

new_speaking_select = """<select id="speaking-sentence-select" onchange="changeSpeakingSentence(this.value)" class="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none">
            <option value="0">Câu 1: IELTS Speaking Part 3 (Technology & Education)</option>
            <option value="1">Câu 2: Business English (Corporate Strategy)</option>
            <option value="2">Câu 3: IELTS Speaking Part 2 (Personal Growth & Resilience)</option>
            <option value="3">Câu 4: IELTS Speaking Part 3 (Environmental Sustainability)</option>
            <option value="4">Câu 5: IELTS Speaking Part 3 (AI & Future Workforce)</option>
            <option value="5">Câu 6: IELTS Speaking Part 1 (Urbanization & Hometown)</option>
            <option value="6">Câu 7: IELTS Speaking Part 3 (Cultural Heritage Preservation)</option>
            <option value="7">Câu 8: IELTS Speaking Part 2 (Technological Breakthroughs)</option>
          </select>"""

if old_speaking_select in html_content:
    html_content = html_content.replace(old_speaking_select, new_speaking_select)
    print("✓ Đã cập nhật 8 câu Speaking mẫu vào index.html")

with open(INDEX_PATH, "w", encoding="utf-8") as f:
    f.write(html_content)


# 2. Update public/js/study.js
with open(STUDY_JS_PATH, "r", encoding="utf-8") as f:
    js_content = f.read()

# Replace insertSampleBand8Essay and add IELTS_WRITING_TOPICS_DATABASE and onWritingTopicChange
replacement_js = """
    // ==============================================================================
    // KHO DỮ LIỆU 15 CHỦ ĐỀ IELTS WRITING TASK 2 & BÀI LUẬN MẪU BAND 8.0+
    // ==============================================================================
    const IELTS_WRITING_TOPICS = [
      {
        id: 1,
        title: "Chủ đề 1 (Education & AI): Online platforms & AI replacing traditional classrooms",
        prompt: "Some people believe that artificial intelligence and online platforms will replace traditional classrooms and teachers in the near future. To what extent do you agree or disagree?",
        category: "Giáo Dục & Trí Tuệ Nhân Tạo",
        type: "Opinion (Agree/Disagree)",
        tip: "Cấu trúc 4 đoạn: Khẳng định quan điểm một phần (Partially Agree) hoặc phản bác (Disagree) rằng AI chỉ đóng vai trò bổ trợ, không thể thay thế sự đồng cảm và định hướng đạo đức của giáo viên.",
        sampleEssay: `In the contemporary era, artificial intelligence and automated online platforms have revolutionized instructional delivery. While some proponents assert that digital technologies will render conventional classrooms and human educators obsolete, I firmly disagree with this view, as interpersonal mentorship and holistic pedagogy remain irreducibly human.\\n\\nOn the one hand, digital learning environments provide undeniable pedagogical advantages. Automated algorithms can personalize learning pace, deliver immediate diagnostic feedback, and democratize access to world-class academic resources regardless of geographical constraints. For instance, intelligent tutoring systems can identify a student\\'s grammatical vulnerabilities in seconds, thereby optimizing rote academic drills.\\n\\nNevertheless, education extends far beyond algorithmic knowledge dissemination. Human educators cultivate critical inquiry, emotional resilience, and moral discernment—facets that artificial neural networks cannot replicate. Furthermore, the physical classroom functions as a vital social crucible where collaborative negotiation, empathy, and conflict resolution are organically nurtured through peer-to-peer discourse.\\n\\nIn conclusion, although artificial intelligence represents an invaluable auxiliary instrument in modern pedagogical frameworks, it cannot substitute the transformative intellectual and psychosocial guidance provided by human teachers. Therefore, institutions should embrace hybrid learning rather than attempting wholesale teacher replacement.`
      },
      {
        id: 2,
        title: "Chủ đề 2 (Higher Education): Free university tuition vs. Self-funded tuition",
        prompt: "Some people think that university education should be free for all students, while others believe students should pay tuition fees since they benefit individually. Discuss both views and give your opinion.",
        category: "Giáo Dục Đại Học",
        type: "Discussion (Discuss both views & Opinion)",
        tip: "Cấu trúc 4 đoạn: Đoạn 1 bàn về lợi ích xã hội của miễn học phí đại học; Đoạn 2 bàn về trách nhiệm cá nhân và ngân sách nhà nước; Đoạn kết đưa ra giải pháp học bổng kết hợp tín dụng sinh viên.",
        sampleEssay: `The question of whether tertiary education should be entirely state-funded or financed by individual undergraduates remains a contentious socioeconomic debate. While subsidized tuition promotes social mobility, I contend that a shared-cost model combined with meritocratic subsidies is the most sustainable approach.\\n\\nAdvocates of universal free higher education argue that intellectual capital is a public good that fuels national economic prosperity. When universities abolish financial barriers, underprivileged students can access tertiary degrees, mitigating systemic socioeconomic inequality. For example, Scandinavian nations that offer tuition-free universities boast lower wage disparity and higher research outputs, demonstrating the profound collective dividends of an educated populace.\\n\\nConversely, opponents emphasize fiscal constraints and personal accountability. Higher education primarily enhances an individual\\'s lifetime earning potential; thus, graduates ought to invest in their own upward mobility. Furthermore, when governments absorb all tuition expenses, public budgets for vital primary healthcare and secondary schooling are inevitably strained, and university diplomas may suffer from credential inflation due to declining per-student university revenue.\\n\\nIn conclusion, while total state funding fosters educational equality, complete individual liability risks disenfranchising talented students. A balanced system—where subsidized tuition is coupled with income-contingent loans and targeted scholarships—ensures both institutional quality and broad societal equity.`
      },
      {
        id: 3,
        title: "Chủ đề 3 (Child Development): Screen time and digital devices for children",
        prompt: "Children are spending an increasing amount of time using digital screens and smartphones for study and leisure. Is this a positive or negative development?",
        category: "Phát Triển Trẻ Em & Kỹ Thuật Số",
        type: "Positive or Negative Development",
        tip: "Cấu trúc 4 đoạn: Phân tích các lợi ích về học tập số, sau đó chứng minh các tác động tiêu cực đối với thể chất và tâm lý (sedentary lifestyle, social isolation) chiếm ưu thế hơn.",
        sampleEssay: `The pervasive integration of electronic tablets and smartphones into the daily routines of adolescents has ignited fierce debate among pediatricians and educators. In my view, while digital literacy is advantageous, the disproportionate allocation of screen time represents a predominantly detrimental development for youth development.\\n\\nAdmittedly, digital devices serve as formidable learning instruments when deployed judiciously. Interactive educational applications stimulate early numeracy, foster linguistic proficiency, and facilitate interactive research for academic projects. Moreover, exposure to digital media familiarizes youngsters with technological tools indispensable for future employability in an increasingly computerized global economy.\\n\\nHowever, these cognitive benefits are overshadowed by severe physical and psychological repercussions. Excessive sedentary screen time precipitates alarming rates of childhood obesity, optical strain, and chronic sleep disruption caused by blue-light emission. More critically, constant exposure to algorithmically curated content truncates attention spans and curtails spontaneous physical socialization, precipitating heightened adolescent anxiety and interpersonal detachment.\\n\\nIn conclusion, despite the educational utility of electronic devices, unregulated screen immersion fundamentally undermines children\\'s physical well-being and emotional maturation. Guardians and academic institutions must therefore enforce rigorous screen-time quotas and revive active outdoor exploration.`
      },
      {
        id: 4,
        title: "Chủ đề 4 (Environment & Economy): Economic growth vs. Environmental protection",
        prompt: "Governments worldwide should prioritize economic growth even if it leads to environmental damage. Discuss both views and give your opinion.",
        category: "Môi Trường & Kinh Tế",
        type: "Discussion (Discuss both views & Opinion)",
        tip: "Cấu trúc 4 đoạn: Thảo luận tại sao tăng trưởng kinh tế tạo công ăn việc làm; thảo luận hậu quả suy thoái môi trường không thể phục hồi; kết luận rằng kinh tế xanh bền vững là bắt buộc.",
        sampleEssay: `A perennial dilemma confronting policy architects is whether macroeconomic expansion should take precedence over ecological conservation. While financial prosperity provides the capital required for societal well-being, I firmly believe that sacrificing the environment for short-term fiscal gains is fundamentally self-destructive.\\n\\nProponents of unrestrained economic growth contend that rapid industrial expansion is the most effective weapon against poverty. Developing nations, in particular, rely on manufacturing and natural resource extraction to construct infrastructure, generate employment, and elevate living standards. Without substantial GDP growth, governments cannot accumulate the sovereign tax revenue needed to fund social safety nets or invest in green technological innovations.\\n\\nNonetheless, prioritizing industrial output at the expense of ecological equilibrium induces irreversible catastrophes. Anthropogenic climate change, deforestation, and biodiversity depletion directly trigger agricultural failures, severe weather events, and public health crises that ultimately inflict staggering economic losses far exceeding initial industrial profits. A contaminated ecosystem undermines the very biological foundations upon which human economies depend.\\n\\nIn conclusion, treating economic growth and environmental preservation as mutually exclusive is a flawed paradigm. Governments must decouple economic prosperity from environmental exploitation by mandating circular economy principles and clean energy subsidies, ensuring that progress does not compromise planetary survival.`
      },
      {
        id: 5,
        title: "Chủ đề 5 (Climate Action): Individual lifestyle changes vs. Strict government legislation",
        prompt: "Many scientists argue that individual lifestyle changes are insufficient to combat climate change, and only strict government environmental regulations can succeed. To what extent do you agree or disagree?",
        category: "Hành Động Khí Hậu",
        type: "Opinion (Agree/Disagree)",
        tip: "Cấu trúc 4 đoạn: Đồng ý mạnh mẽ rằng chỉ có luật pháp và thuế carbon mới thay đổi được các tập đoàn xả thải lớn, trong khi cá nhân hóa trách nhiệm là không đủ.",
        sampleEssay: `In recent years, environmental discourse has increasingly questioned whether grass-roots lifestyle modifications alone can arrest planetary warming. I completely concur with the scientific consensus that voluntary civic measures are inadequate, and that rigorous governmental mandate is the only viable catalyst for meaningful climate remediation.\\n\\nUndeniably, conscientious consumer behaviors—such as recycling household plastics or embracing public transit—foster environmental awareness and incrementally lower residential emissions. However, the cumulative magnitude of these individual initiatives is negligible when compared against the colossal carbon footprint generated by heavy manufacturing, fossil-fuel power grids, and international cargo shipping.\\n\\nIn stark contrast, sovereign governments wield unique legislative and regulatory levers capable of systemic structural transformation. By enforcing stringent carbon taxation, mandating rigorous corporate emissions disclosures, and terminating subsidies for coal and petroleum exploration, states can compel multinational conglomerates to decarbonize supply chains. For example, statutory bans on internal combustion engines across European jurisdictions have accelerated commercial investments in electric vehicle infrastructure far more effectively than voluntary consumer restraint ever could.\\n\\nIn conclusion, while personal ecological stewardship is commendable, it cannot dismantle the industrial architecture of pollution. Only decisive, legally binding government interventions can enforce industrial accountability and safeguard the global biosphere at the required scale.`
      },
      {
        id: 6,
        title: "Chủ đề 6 (Renewable Energy): Phasing out fossil fuels for clean green energy",
        prompt: "Some countries are transitioning from fossil fuels to renewable energy sources such as solar and wind. Do the advantages of this transition outweigh the disadvantages?",
        category: "Năng Lượng Tái Tạo",
        type: "Advantages vs. Disadvantages",
        tip: "Cấu trúc 4 đoạn: Nêu ngắn gọn thách thức gián đoạn năng lượng và chi phí ban đầu; sau đó chứng minh lợi ích to lớn về giảm khí thải, an ninh năng lượng và sức khỏe cộng đồng.",
        sampleEssay: `The geopolitical transition from combustible hydrocarbons toward sustainable energy infrastructures represents a defining epoch in modern history. Although this paradigm shift involves formidable initial capital expenditure and grid instability, I am convinced that the enduring benefits vastly outweigh the drawbacks.\\n\\nThe primary challenges associated with renewable energy stem from technical intermittency and transitional economic disruption. Solar photovoltaics and wind turbines rely heavily on ambient meteorological conditions, necessitating expensive battery storage technologies to maintain steady baseload power. Furthermore, the decommissioning of fossil-fuel extraction industries inevitably displaces hundreds of thousands of miners and refinery workers, causing localized economic distress.\\n\\nNevertheless, the environmental, geopolitical, and economic imperatives for decarbonization are overwhelming. Eliminating coal and petroleum consumption drastically curtails atmospheric greenhouse gases, thereby mitigating catastrophic ocean acidification and global warming. Moreover, harnessing domestic solar, geothermal, and wind resources liberates sovereign nations from price volatility in global oil markets, cementing national energy security while stimulating millions of high-tech engineering jobs.\\n\\nIn conclusion, despite the transitional costs and storage hurdles, the shift toward renewable power is an ecological and economic necessity. The long-term dividends of planetary preservation and decentralized energy independence unequivocally surpass the temporary friction of industrial realignment.`
      },
      {
        id: 7,
        title: "Chủ đề 7 (Globalization & Work): English proficiency in multinational corporations",
        prompt: "Many multinational corporations require employees to possess certified English proficiency. Why is this happening, and is it a positive or negative development?",
        category: "Toàn Cầu Hóa & Việc Làm",
        type: "Two-part Question (Causes & Evaluation)",
        tip: "Cấu trúc 4 đoạn: Đoạn 1 giải thích nguyên nhân do chuỗi cung ứng toàn cầu và chuẩn hóa giao tiếp; Đoạn 2 đánh giá đây là sự phát triển tích cực nhưng cần bảo tồn ngôn ngữ bản địa.",
        sampleEssay: `In the contemporary corporate landscape, an overwhelming proportion of multinational enterprises mandate standardized English fluency as an indispensable employment prerequisite. This phenomenon is primarily driven by operational globalization, and I consider it a decidedly positive development for international collaboration.\\n\\nThe paramount catalyst behind this institutional requirement is the necessity for frictionless cross-border coordination. Modern conglomerates disperse research, manufacturing, and legal departments across diverse continents; without a universally recognized lingua franca, organizational cohesion collapses under the weight of translation delays and miscommunication. Implementing English as a standardized operational medium streamlines virtual meetings, technical documentation, and strategic alignment across culturally diverse teams.\\n\\nFrom a socioeconomic perspective, this linguistic homogenization is overwhelmingly beneficial. For ambitious professionals, certified English proficiency serves as an egalitarian passport to lucrative career advancement, knowledge transfer, and international mobility. Furthermore, a shared language facilitates accelerated global knowledge dissemination, allowing breakthrough technological innovations and medical research to transcend parochial borders seamlessly.\\n\\nIn conclusion, corporate mandates for certified English proficiency reflect the practical demands of globalized commerce. Provided that local linguistic traditions are respectfully nurtured in cultural spheres, establishing a universal corporate language fosters unprecedented global productivity and mutual commercial prosperity.`
      },
      {
        id: 8,
        title: "Chủ đề 8 (Modern Workforce): Remote working from home",
        prompt: "Remote working and telecommuting from home have become widespread across many corporate sectors. Do the benefits of working from home outweigh the drawbacks?",
        category: "Xu Hướng Lao Động",
        type: "Advantages vs. Disadvantages",
        tip: "Cấu trúc 4 đoạn: Trình bày nhược điểm về ranh giới công việc-gia đình và sự suy giảm văn hóa công ty; chứng minh ưu điểm về tiết kiệm thời gian di chuyển và năng suất vượt trội.",
        sampleEssay: `The accelerated diffusion of telecommuting and remote work models has fundamentally restructured contemporary employment dynamics. While this paradigm introduces challenges regarding workplace cohesion and blurred domestic boundaries, I maintain that its advantages for productivity and personal well-being clearly eclipse the disadvantages.\\n\\nOn the negative side, remote working can erode organizational culture and psychological well-being. The absence of spontaneous hallway interactions inhibits organic brainstorming and weakens corporate camaraderie, occasionally culminating in feelings of professional isolation. Moreover, when domestic residences transform into operational offices, employees frequently struggle to disconnect from digital communications, exacerbating burnout and work-family conflict.\\n\\nConversely, the tangible benefits of telecommuting are monumental. By eradicating arduous daily commutes, workers reclaim hours each week, drastically reducing chronic commuter stress and greenhouse gas emissions associated with urban vehicular congestion. Furthermore, empirical workplace studies indicate that remote employees enjoy enhanced concentration on complex cognitive tasks when shielded from open-office distractions, resulting in heightened qualitative output and superior job satisfaction.\\n\\nIn conclusion, while telecommuting necessitates sophisticated managerial adaptations to preserve corporate identity, its capacity to optimize work-life balance and operational efficiency is unmatched. The merits of remote employment unequivocally outweigh its transitional challenges.`
      },
      {
        id: 9,
        title: "Chủ đề 9 (AI & Employment): Technological unemployment and labor automation",
        prompt: "Rapid advances in automation and artificial intelligence are threatening both manual and white-collar jobs. What problems does this cause, and what solutions can governments propose?",
        category: "Công Nghệ & Việc Làm",
        type: "Problems & Solutions",
        tip: "Cấu trúc 4 đoạn: Đoạn 1 nêu các vấn đề về bất bình đẳng giàu nghèo và thất nghiệp cơ cấu; Đoạn 2 đề xuất chính sách đào tạo lại (reskilling) và thuế tự động hóa (robot tax).",
        sampleEssay: `The rapid deployment of generative artificial intelligence and industrial robotics has cast a formidable shadow over global labor markets, threatening to displace workers across clerical, creative, and technical domains. This dislocation precipitates severe socioeconomic crises, but proactive legislative interventions can mitigate its worst impacts.\\n\\nThe principal crisis unleashed by hyper-automation is widespread structural unemployment and acute income polarization. Unlike previous industrial revolutions that primarily automated manual tasks, contemporary algorithms rapidly surpass human proficiency in cognitive workflows like paralegal research, financial forecasting, and coding. Workers whose competencies become abruptly obsolete face protracted unemployment, widening the socioeconomic chasm between capital owners who monopolize automated intellectual property and disenfranchised laborers.\\n\\nTo avert catastrophic societal instability, sovereign states must implement systemic policy countermeasures. Firstly, educational curricula must be radically overhauled, emphasizing lifelong vocational reskilling programs funded through automation levies or targeted corporate robotics taxes. Secondly, governments should pilot Universal Basic Income (UBI) mechanisms to establish a non-negotiable living floor for citizens transitioning between traditional employment and the emerging digital gig economy.\\n\\nIn conclusion, unchecked labor automation threatens to unravel social cohesion through widespread technological unemployment. However, through aggressive vocational re-education and progressive redistribution mechanisms, societies can navigate this technological transition safely.`
      },
      {
        id: 10,
        title: "Chủ đề 10 (Public Health): Sugar and junk food taxation to combat obesity",
        prompt: "The rate of obesity and lifestyle-related diseases is increasing worldwide. Some believe governments should impose heavy taxes on fast food and sugary drinks to encourage healthier diets. To what extent do you agree or disagree?",
        category: "Sức Khỏe Cộng Đồng",
        type: "Opinion (Agree/Disagree)",
        tip: "Cấu trúc 4 đoạn: Đồng ý rằng thuế tiêu thụ đặc biệt là đòn bẩy kinh tế hiệu quả, nhưng cần kết hợp trợ cấp thực phẩm sạch và giáo dục dinh dưỡng học đường.",
        sampleEssay: `The modern epidemic of morbid obesity and cardiovascular morbidity poses an existential strain on public healthcare systems globally. I strongly agree that implementing fiscal penalties on ultra-processed foods and carbonated sugary beverages is a justified and potent intervention to promote public wellness.\\n\\nThe fundamental justification for punitive sin taxes lies in proven behavioral economics. Consumption of heavily sweetened drinks and fast food is highly price-elastic among vulnerable demographics, particularly adolescents and low-income households. When excise taxes artificially elevate the retail price of sugary sodas, consumer purchasing patterns predictably pivot toward healthier, un-taxed alternatives such as fresh water and unadulterated milk, as evidenced by successful tax rollouts in Mexico and the United Kingdom.\\n\\nFurthermore, the revenue generated from junk food taxation can be ring-fenced to subsidize nutritious agrarian produce, such as fresh fruits and vegetables, while funding municipal sports facilities and preventative healthcare screening. Relying purely on voluntary nutritional labeling has proved utterly ineffective against the multi-billion-dollar marketing machines of multinational confectionery corporations; statutory economic disincentives are therefore indispensable.\\n\\nIn conclusion, imposing heavy excise duties on nutritionally bankrupt food products represents a medically urgent and economically sound policy. Combined with affordable healthy food subsidies, it constitutes our most effective bulwark against global chronic illness.`
      },
      {
        id: 11,
        title: "Chủ đề 11 (Urban Planning): Megacity congestion and housing shortages",
        prompt: "Rapid urbanization has caused traffic congestion, air pollution, and housing shortages in megacities. What are the main causes, and what urban planning measures can resolve these issues?",
        category: "Đô Thị Hóa & Quy Hoạch",
        type: "Problems & Solutions",
        tip: "Cấu trúc 4 đoạn: Nêu nguyên nhân do tập trung cơ hội việc làm và hạ tầng thiếu đồng bộ; giải pháp gồm phát triển đô thị vệ tinh và mở rộng giao thông công cộng tàu điện ngầm.",
        sampleEssay: `Across the developing and developed world, the exponential migration of citizens from rural hinterlands into metropolitan hubs has overwhelmed municipal infrastructure, precipitating crippling gridlock, deteriorating air quality, and astronomical housing costs. Addressing these crises requires identifying their root causes and deploying visionary regional planning.\\n\\nThe chief driver of hyper-urbanization is the intense concentration of economic capital, elite universities, and specialized healthcare facilities within primary metropolitan centers. Rural regions frequently languish in infrastructural underinvestment, compelling young demographics to migrate in pursuit of professional advancement. Consequently, municipal transit networks and residential zoning frameworks, designed for modest populations, collapse under excessive demographic density.\\n\\nTo rectify this unsustainable spatial imbalance, governments must prioritize regional decentralization and Transit-Oriented Development (TOD). By establishing connected satellite cities equipped with subsidized commercial zones, fiscal tax holidays, and high-speed intercity railway links, states can incentivize corporations and citizens to relocate away from congested megacity centers. Simultaneously, metropolitan authorities must mandate high-density affordable housing quotas near mass rapid transit (MRT) hubs to suppress speculative real estate inflation.\\n\\nIn conclusion, urban congestion and housing scarcity stem from centralized socioeconomic opportunity. Dispersing economic incentives toward vibrant secondary cities and funding mass rapid transit offer the most durable resolution.`
      },
      {
        id: 12,
        title: "Chủ đề 12 (Mental Health): Social media addiction and youth mental health",
        prompt: "The widespread use of social media platforms has led to rising anxiety, depression, and social isolation among adolescents. What factors contribute to this, and how can society address it?",
        category: "Sức Khỏe Tâm Thần & Mạng Xã Hội",
        type: "Causes & Solutions",
        tip: "Cấu trúc 4 đoạn: Đoạn 1 phân tích nguyên nhân do thuật toán gây nghiện dopamine và văn hóa so sánh ngoại hình; Đoạn 2 đưa ra giải pháp kiểm soát độ tuổi và giáo dục sức khỏe tâm lý.",
        sampleEssay: `The contemporary epidemic of adolescent psychiatric distress has coincided precisely with the ubiquitous adoption of algorithmic social networking applications. This alarming crisis is fueled by predatory digital design and toxic social comparison, requiring concerted multi-stakeholder remedies.\\n\\nThe primary catalyst underlying youth mental degradation is the deliberate architecture of social media algorithms engineered to maximize user screen-retention via variable dopamine rewards. Constant exposure to hyper-curated, digitally enhanced portrayals of peers\\' affluent lifestyles and beauty standards induces relentless status anxiety, body dysmorphia, and fear of missing out (FOMO). Furthermore, the substitution of nuanced face-to-face interaction with superficial digital metrics like likes and shares starves developing adolescents of authentic interpersonal intimacy, fostering acute existential loneliness.\\n\\nTo dismantle this digital crisis, regulatory and familial interventions must be enacted concurrently. National telecommunication watchdogs should mandate rigorous age-verification safeguards and ban algorithmic recommendation feeds for minors during nocturnal hours. Concurrently, academic institutions must embed mandatory digital resilience modules into health curricula, teaching adolescents to deconstruct virtual illusions while encouraging parents to establish screen-free dinner and bedroom sanctuaries.\\n\\nIn conclusion, adolescent psychological distress in the digital era is an engineered consequence of unregulated social platforms. Only by curtailing algorithmic exploitation and re-establishing grounded interpersonal relationships can society preserve the mental sanctity of youth.`
      },
      {
        id: 13,
        title: "Chủ đề 13 (Cultural Heritage): Preserving historical heritage vs. Modern public services",
        prompt: "Some argue that government budgets should be spent on preserving historical monuments and cultural heritage, while others think money is better spent on modern public services like hospitals. Discuss both views and give your opinion.",
        category: "Văn Hóa & Ngân Sách Quốc Gia",
        type: "Discussion (Discuss both views & Opinion)",
        tip: "Cấu trúc 4 đoạn: Thảo luận tầm quan trọng của y tế và cơ sở hạ tầng thiết yếu; thảo luận vai trò linh hồn dân tộc và kinh tế du lịch của di sản; kết luận mô hình công tư kết hợp.",
        sampleEssay: `The allocation of sovereign fiscal budgets frequently sparks passionate philosophical debates regarding whether priority should be accorded to historical preservation or immediate public infrastructure. While safeguarding citizen physical welfare is imperative, I contend that cultural conservation is equally vital for national identity and economic vitality.\\n\\nThose who advocate prioritizing modern public amenities point to the non-negotiable necessities of life. In many nations, overloaded public hospitals, dilapidated schools, and congested transport arteries directly impair citizens\\' quality of life and economic productivity. Diverting millions of dollars to restore ancient masonry while impoverished patients face acute healthcare shortages strikes many as a misplaced, morally questionable budgetary priority.\\n\\nNevertheless, preserving architectural landmarks and intangible cultural heritage is far from an indulgent vanity. Historic monuments embody a society\\'s collective memory, anchoring citizen identity and national solidarity against the tide of cultural homogenization. Furthermore, well-conserved cultural landmarks serve as potent economic engines that stimulate vibrant international tourism industries, generating substantial tax revenues that can subsequently be reinvested into public health and education.\\n\\nIn conclusion, public administration should not treat civic infrastructure and cultural conservation as mutually exclusive adversaries. A judicious fiscal policy combines public funding with private heritage philanthropy, ensuring both bodily health and cultural enrichment.`
      },
      {
        id: 14,
        title: "Chủ đề 14 (Crime & Punishment): Incarceration vs. Education & Vocational rehabilitation",
        prompt: "Some believe that harsher prison sentences are the most effective deterrent to crime, while others argue that education and vocational rehabilitation are far more effective. Discuss both views and give your opinion.",
        category: "Pháp Luật & Cải Tạo Tội Phạm",
        type: "Discussion (Discuss both views & Opinion)",
        tip: "Cấu trúc 4 đoạn: Đoạn 1 nêu tính răn đe của án tù nặng; Đoạn 2 chứng minh giáo dục nghề nghiệp giải quyết gốc rễ tái phạm (recidivism); Kết luận mô hình cải tạo tiến bộ.",
        sampleEssay: `The optimal philosophical orientation of the criminal justice system remains an enduring source of legal and moral contention. While punitive incarceration delivers retributive deterrence, I am firmly convinced that comprehensive educational and vocational rehabilitation provides a far more sustainable strategy for reducing recidivism.\\n\\nAdvocates of severe penal sentencing maintain that prolonged imprisonment is necessary to incapacitate dangerous offenders and satisfy civic demands for retributive justice. The prospect of lengthy confinement behind bars theoretically functions as a psychological deterrent to prospective lawbreakers, while assuring crime victims that their suffering has been acknowledged by the state. Without stringent penalties, public faith in the rule of law may erode, potentially encouraging vigilantism.\\n\\nHowever, empirical penal research consistently proves that harsh prison sentences fail to deter crime and frequently exacerbate criminal tendencies. Incarceration concentrates offenders in antisocial environments where criminal networks are reinforced, while societal stigmatization upon release renders lawful employment virtually unattainable. In contrast, correctional models that provide accredited secondary schooling, psychological trauma therapy, and vocational apprenticeships equip ex-convicts with viable socioeconomic alternatives, driving recidivism rates downward dramatically, as evidenced by Nordic justice systems.\\n\\nIn conclusion, although punitive confinement remains necessary for incorrigible violent criminals, education and humane vocational rehabilitation must constitute the primary pillar of modern justice. Healing societal wounds is vastly superior to perpetual punishment.`
      },
      {
        id: 15,
        title: "Chủ đề 15 (Consumerism & Ads): Commercial advertising manipulating consumer behavior",
        prompt: "Modern advertising creates artificial consumer needs and promotes an unsustainable culture of materialistic consumerism. To what extent do you agree or disagree?",
        category: "Văn Hóa Tiêu Dùng & Quảng Cáo",
        type: "Opinion (Agree/Disagree)",
        tip: "Cấu trúc 4 đoạn: Đồng ý mạnh mẽ rằng quảng cáo hiện đại khai thác tâm lý bất an để bán những thứ không cần thiết, gây lãng phí tài nguyên và rác thải môi trường.",
        sampleEssay: `In our hyper-commercialized global economy, promotional marketing campaigns permeate virtually every digital interface and public space. I wholeheartedly agree that contemporary advertising no longer merely informs citizens of product availability, but aggressively manufactures artificial desires, cultivating a toxic and ecologically destructive culture of consumerism.\\n\\nThe primary methodology of modern advertising relies on sophisticated psychological manipulation. Rather than highlighting objective utilitarian utility, marketing agencies orchestrate campaigns that associate ownership of luxury automobiles, fast fashion, or cutting-edge smartphones with elite social prestige, romantic desirability, and personal self-worth. By subtly exacerbating consumers\\' insecurities regarding their social standing, promotional algorithms convince individuals that happiness is contingent upon acquiring non-essential, ephemeral goods.\\n\\nThis manufactured consumerism yields profound ecological and economic consequences. The culture of planned obsolescence and fast consumption drives catastrophic planetary resource depletion, accumulating mountains of electronic waste and non-biodegradable plastics in landfills. Moreover, widespread advertising encourages irresponsible personal credit accumulation, plunging ordinary working-class families into crippling consumer debt in pursuit of unneeded status symbols.\\n\\nIn conclusion, modern advertising has devolved from benign commercial notification into aggressive psychological coercion. Governments must enforce stricter truth-in-advertising regulations and ban targeted predatory marketing directed at impressionable youth to arrest this unsustainable materialistic tide.`
      }
    ];

    // Cập nhật thẻ hiển thị đề bài chi tiết khi học viên đổi chủ đề
    function onWritingTopicChange() {
      const select = document.getElementById('writing-topic-select');
      if (!select) return;
      const selectedValue = select.value;
      const topicObj = IELTS_WRITING_TOPICS.find(t => t.prompt === selectedValue) || IELTS_WRITING_TOPICS[0];

      const fullTextEl = document.getElementById('writing-topic-full-text');
      const badgeEl = document.getElementById('writing-topic-type-badge');
      const tipEl = document.getElementById('writing-topic-tip');

      if (fullTextEl) fullTextEl.textContent = `"${topicObj.prompt}"`;
      if (badgeEl) badgeEl.textContent = topicObj.type;
      if (tipEl) tipEl.textContent = topicObj.tip;
    }

    // Chèn bài luận mẫu Band 8.0+ tương ứng chuẩn xác với chủ đề đang chọn
    function insertSampleBand8Essay() {
      const select = document.getElementById('writing-topic-select');
      const selectedValue = select ? select.value : '';
      const topicObj = IELTS_WRITING_TOPICS.find(t => t.prompt === selectedValue) || IELTS_WRITING_TOPICS[0];

      const essayInput = document.getElementById('writing-essay-input');
      if (essayInput) {
        essayInput.value = topicObj.sampleEssay.trim();
        updateEssayWordCount();
        if (typeof showToast === 'function') {
          showToast(`Đã chèn bài luận mẫu Band 8.0 cho ${topicObj.category}!`, 'success');
        }
      }
    }

    // Danh sách 8 câu Speaking mẫu kèm IPA
    const SPEAKING_SENTENCES = [
      {
        title: "IELTS Speaking Part 3 (Technology & Education)",
        text: "Interactive online platforms help bridge the gap between theoretical knowledge and practical skills.",
        ipa: "/ˌɪn.təˈræk.tɪv ˈɒn.laɪn ˈplæt.fɔːmz help brɪdʒ ðə ɡæp bɪˈtwiːn θɪəˈret.ɪ.kəl ˈnɒl.ɪdʒ ænd ˈpræk.tɪ.kəl skɪlz/"
      },
      {
        title: "Business English (Corporate Strategy)",
        text: "Sustainable business practices foster long-term shareholder value and brand loyalty.",
        ipa: "/səˈsteɪ.nə.bəl ˈbɪz.nɪs ˈpræk.tɪ.sɪz ˈfɒs.tər ˌlɒŋ.tɜːm ˈʃeəˌhəʊl.dər ˈvæl.juː ænd brænd ˈlɔɪ.əl.ti/"
      },
      {
        title: "IELTS Speaking Part 2 (Personal Growth & Resilience)",
        text: "Overcoming academic obstacles requires resilience, disciplined habits, and critical thinking.",
        ipa: "/ˌəʊ.vəˈkʌm.ɪŋ ˌæk.əˈdem.ɪk ˈɒb.stə.kəlz rɪˈkwaɪəz rɪˈzɪl.jəns, ˈdɪs.ə.plɪnd ˈhæb.ɪts, ænd ˈkrɪt.ɪ.kəl ˈθɪŋ.kɪŋ/"
      },
      {
        title: "IELTS Speaking Part 3 (Environmental Sustainability)",
        text: "Renewable energy adoption plays a pivotal role in mitigating catastrophic climate change.",
        ipa: "/rɪˈnjuː.ə.bəl ˈen.ə.dʒi əˈdɒp.ʃən pleɪz ə ˈpɪv.ə.təl rəʊl ɪn ˈmɪt.ɪ.ɡeɪ.tɪŋ ˌkæt.əˈstrɒf.ɪk ˈklaɪ.mət tʃeɪndʒ/"
      },
      {
        title: "IELTS Speaking Part 3 (AI & Future Workforce)",
        text: "Artificial intelligence will inevitably reshape occupational landscapes across all corporate sectors.",
        ipa: "/ˌɑː.tɪˈfɪʃ.əl ɪnˈtel.ɪ.dʒəns wɪl ɪnˈev.ɪ.tə.bli ˌriːˈʃeɪp ˌɒk.jəˈpeɪ.ʃən.əl ˈlænd.skeɪps əˈkrɒs ɔːl ˈsek.tərz/"
      },
      {
        title: "IELTS Speaking Part 1 (Urbanization & Hometown)",
        text: "My hometown has experienced tremendous urbanization with high-rise buildings and modern transport.",
        ipa: "/maɪ ˈhəʊm.taʊn hæz ɪkˈspɪə.ri.ənst trəˈmen.dəs ˌɜː.bən.aɪˈzeɪ.ʃən wɪð haɪ-raɪz ˈbɪl.dɪŋz ænd ˈmɒd.ən ˈtræn.spɔːt/"
      },
      {
        title: "IELTS Speaking Part 3 (Cultural Heritage Preservation)",
        text: "Preserving indigenous cultural traditions is paramount in our increasingly homogenized world.",
        ipa: "/prɪˈzɜː.vɪŋ ɪnˈdɪdʒ.ɪ.nəs ˈkʌl.tʃər.əl trəˈdɪʃ.ənz ɪz ˈpær.ə.maʊnt ɪn ˈaʊə.li ɪnˈkriː.sɪŋ.li həˈmɒdʒ.ə.naɪzd wɜːld/"
      },
      {
        title: "IELTS Speaking Part 2 (Technological Breakthroughs)",
        text: "Technological breakthroughs have fundamentally altered how individuals communicate and collaborate.",
        ipa: "/ˌtek.nəˈlɒdʒ.ɪ.kəl ˈbreɪk.θruːz hæv ˌfʌn.dəˈmen.təl.i ˈɔːl.təd haʊ ˌɪn.dɪˈvɪdʒ.u.əlz kəˈmjuː.nɪ.keɪt ænd kəˈlæb.ə.reɪt/"
      }
    ];

    function changeSpeakingSentence(idx) {
      const item = SPEAKING_SENTENCES[Number(idx)] || SPEAKING_SENTENCES[0];
      const targetText = document.getElementById('speaking-target-text');
      const targetIpa = document.getElementById('speaking-target-ipa');
      if (targetText) targetText.textContent = `"${item.text}"`;
      if (targetIpa) targetIpa.textContent = item.ipa;
    }
"""

# Replace old insertSampleBand8Essay function in study.js
old_insert_pattern = re.compile(
    r'function insertSampleBand8Essay\(\)\s*\{.*?updateEssayWordCount\(\);\s*\}',
    re.DOTALL
)

if old_insert_pattern.search(js_content):
    js_content = old_insert_pattern.sub(replacement_js, js_content, count=1)
    print("✓ Đã cập nhật 15 bài luận mẫu Band 8.0 & kho đề vào study.js")
else:
    print("⚠ Không tìm thấy hàm insertSampleBand8Essay cũ trong study.js")

# Also update changeSpeakingSentence in study.js if it exists separately
old_change_speaking = """function changeSpeakingSentence(sentence) {
      const disp = document.getElementById('speaking-target-display') || document.getElementById('speaking-target-sentence');
      if (disp) disp.textContent = `"${sentence}"`;
    }"""
if old_change_speaking in js_content:
    js_content = js_content.replace(old_change_speaking, "// changeSpeakingSentence moved to IELTS SPEAKING DATABASE")

with open(STUDY_JS_PATH, "w", encoding="utf-8") as f:
    f.write(js_content)

print("Hoàn tất cập nhật kho đề IELTS Writing Task 2 & Speaking!")
