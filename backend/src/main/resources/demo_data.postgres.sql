-- Demo Data for Dukaan Dosth (దుకాణ్ దోస్త్)
-- Load ~20 diverse transactions for a comprehensive demo.

-- Sample User (ID: 1)
-- Name: Ramesh, Shop: Ramesh Kirana, Phone: 9876543210
-- Password: password123 (hashed in Spring Boot)
INSERT INTO users (name, phone, password, role, is_active, shop_name)
VALUES ('Ramesh', '9876543210', '$2a$10$8.UnVuG9HHgffUDAlk8UrO60r3mD3z9dM3z9dM3z9dM3z9dM3', 'USER', TRUE, 'Ramesh Kirana');

-- Sales
INSERT INTO transactions (user_id, type, amount, description, category, raw_input)
VALUES 
(1, 'SALE', 500, 'Rice 10kg', 'grocery', 'Ramesh ki 500 ka rice becha'),
(1, 'SALE', 120, 'Milk 2 liters', 'dairy', 'Amma ki 120 ka paalu ammanu'),
(1, 'SALE', 450, 'Oil 2 liters', 'grocery', 'Oil becha 450'),
(1, 'SALE', 80, 'Sugar 1kg', 'grocery', 'Sugar ammanu 80'),
(1, 'SALE', 2000, 'Whole month grocery pack', 'grocery', '2000 store items sale');

-- Expenses
INSERT INTO transactions (user_id, type, amount, description, category, raw_input)
VALUES 
(1, 'EXPENSE', 1500, 'Electricity bill', 'utility', 'Current bill 1500 bhara'),
(1, 'EXPENSE', 800, 'New inventory (Biscuits)', 'inventory', 'Biscuits stock konnanu 800'),
(1, 'EXPENSE', 50, 'Chai and Samosa', 'food', 'Tea and snacks 50'),
(1, 'EXPENSE', 1200, 'Shop Rent', 'rent', 'Rent 1200 pay chesanu');

-- Udhaar (Given)
INSERT INTO transactions (user_id, type, amount, description, customer_name, raw_input)
VALUES 
(1, 'CREDIT_GIVEN', 300, 'Soap and Paste', 'Suresh', 'Suresh ki 300 udhaar diya'),
(1, 'CREDIT_GIVEN', 700, 'Dals and spices', 'Lakshmi', 'Lakshmi ki 700 udhaar');

-- Udhaar (Received)
INSERT INTO transactions (user_id, type, amount, description, customer_name, raw_input)
VALUES 
(1, 'CREDIT_RECEIVED', 200, 'Previous balance partial payment', 'Suresh', 'Suresh 200 udhaar wapas diya');

-- More sales for variety
INSERT INTO transactions (user_id, type, amount, description, category, raw_input)
VALUES 
(1, 'SALE', 35, 'Cigarettes/Matches', 'general', 'Cigarettes sale 35'),
(1, 'SALE', 150, 'Atta 2kg', 'grocery', 'Atta 2kg ammanu 150'),
(1, 'SALE', 25, 'Egg', 'dairy', 'Egg sale 25'),
(1, 'SALE', 900, 'Pulse pack', 'grocery', 'Dals sale 900');

-- Pre-generated Daily Summaries for the past 3 days
INSERT INTO daily_summaries (user_id, summary_date, total_sales, total_expenses, net_profit, total_credit_given, total_credit_received, ai_summary)
VALUES 
(1, CURRENT_DATE - INTERVAL '2 days', 4500, 1200, 3300, 500, 100, 'మీ వ్యాపారం నిన్న చాలా బాగుంది. ₹3300 లాభం వచ్చింది.'),
(1, CURRENT_DATE - INTERVAL '1 day', 3200, 2500, 700, 0, 400, 'నిన్న మీరు ₹700 లాభం పొందారు. ఖర్చులు కాస్త ఎక్కువయ్యాయి.'),
(1, CURRENT_DATE, 4160, 3550, 610, 1000, 200, 'ఈరోజు అమ్మకాలు ₹4160. ₹610 నికర లాభం.');
