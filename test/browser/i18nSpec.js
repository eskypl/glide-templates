require(['plugin/lib/i18n'], function (i18n) {

	var translate = i18n.translate;

	describe('i18n module', function () {

		describe('#translate method with given translation key and data', function () {

			it('should return translation key when translation is not found', function () {
				expect(translate('test.Missing_translation')).to.equal('__{test.Missing_translation}__');
			});

			it('should return translation even when values are missing', function () {
				expect(translate('test.Showing_table_type_new', {
					'type': 'Full'
				})).to.equal('Table type: Full {{info}}.');
			});

			it('should return translation for key with mixed placeholders', function () {
				expect(translate('test.Showing_table_type', {
					type: 'Full',
					'2': 'table'
				})).to.equal('Table type: Full table.');
			});

			it('should return translation for key with old placeholders', function () {
				expect(translate('test.Showing_table_type_old', {
					'1': 'Full',
					'2': 'table'
				})).to.equal('Table type: Full table.');
			});

			it('should return translation for key with old placeholders (without $ sign)', function () {
				expect(translate('test.Showing_table_type_old_ext', {
					'1': 'Full',
					'2': 'table'
				})).to.equal('Table type: Full table.');
			});

			it('should return translation for key with new placeholders', function () {
				expect(translate('test.Showing_table_type_new', {
					'type': 'Full',
					'info': 'table'
				})).to.equal('Table type: Full table.');
			});

			it('should return translation for key with new placeholders (with $ sign)', function () {
				expect(translate('test.Showing_table_type_new_ext', {
					'type': 'Full',
					'info': 'table'
				})).to.equal('Table type: Full table.');
			});


		});
	});
});
