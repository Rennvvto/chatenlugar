INSERT INTO campaigns (slug, name, short_description, description, status, current_letter, current_bid, next_turn, featured_rank)
VALUES
  ('hola', 'HOLA', 'Campaña activa en el diccionario.', 'Campaña de trabajo por letras.', 'active', 'H', 4982, 5000, 1),
  ('sushi', 'Sushi', 'Campaña gastronómica en curso.', 'Campaña gastronómica de trabajo por letras.', 'active', 'S', 3016, 3180, 2),
  ('pizza', 'Pizza', 'Campaña gastronómica en curso.', 'Campaña gastronómica de trabajo por letras.', 'active', 'P', 2765, 2980, 3),
  ('hamburguesas', 'Hamburguesas', 'Campaña gastronómica en curso.', 'Campaña gastronómica de trabajo por letras.', 'active', 'H', 1807, 2050, 4)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO campaign_letters (campaign_id, letter, position, status)
SELECT c.id, letters.letter, letters.position, CASE WHEN letters.position = 1 THEN 'active'::letter_status ELSE 'pending'::letter_status END
FROM campaigns c
CROSS JOIN LATERAL (VALUES ('S', 1), ('U', 2), ('S', 3), ('H', 4), ('I', 5)) AS letters(letter, position)
WHERE c.slug = 'sushi'
ON CONFLICT (campaign_id, position) DO NOTHING;

INSERT INTO campaign_letters (campaign_id, letter, position, status)
SELECT c.id, letters.letter, letters.position, CASE WHEN letters.position = 1 THEN 'active'::letter_status ELSE 'pending'::letter_status END
FROM campaigns c
CROSS JOIN LATERAL (VALUES ('H', 1), ('O', 2), ('L', 3), ('A', 4)) AS letters(letter, position)
WHERE c.slug = 'hola'
ON CONFLICT (campaign_id, position) DO NOTHING;

INSERT INTO campaign_letters (campaign_id, letter, position, status)
SELECT c.id, letters.letter, letters.position, CASE WHEN letters.position = 1 THEN 'active'::letter_status ELSE 'pending'::letter_status END
FROM campaigns c
CROSS JOIN LATERAL (VALUES ('P', 1), ('I', 2), ('Z', 3), ('Z', 4), ('A', 5)) AS letters(letter, position)
WHERE c.slug = 'pizza'
ON CONFLICT (campaign_id, position) DO NOTHING;

INSERT INTO campaign_letters (campaign_id, letter, position, status)
SELECT c.id, letters.letter, letters.position, CASE WHEN letters.position = 1 THEN 'active'::letter_status ELSE 'pending'::letter_status END
FROM campaigns c
CROSS JOIN LATERAL (VALUES ('H', 1), ('A', 2), ('M', 3), ('B', 4), ('U', 5), ('R', 6), ('G', 7), ('U', 8), ('E', 9), ('S', 10), ('A', 11), ('S', 12)) AS letters(letter, position)
WHERE c.slug = 'hamburguesas'
ON CONFLICT (campaign_id, position) DO NOTHING;
