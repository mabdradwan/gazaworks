-- Synthetic legacy accounts in the disposable CI database only.
insert into auth.users(id,email,raw_user_meta_data) values
 ('88000000-0000-0000-0000-000000000001','legacy-individual@example.invalid','{"account_type":"individual","display_name":"Legacy Individual"}'),
 ('88000000-0000-0000-0000-000000000002','legacy-team@example.invalid','{"account_type":"team","display_name":"Legacy Team"}'),
 ('88000000-0000-0000-0000-000000000003','legacy-client@example.invalid','{"account_type":"client","display_name":"Legacy Client"}');
