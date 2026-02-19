import json
import re

import frappe
import frappe.sessions

SCRIPT_TAG_PATTERN = re.compile(r"\<script[^<]*\</script\>")
CLOSING_SCRIPT_TAG_PATTERN = re.compile(r"</script\>")

no_cache = 1
allow_guest = True

def get_context(context):
	csrf_token = frappe.sessions.get_csrf_token()
	frappe.db.commit()

	return {
		"csrf_token": csrf_token
	}