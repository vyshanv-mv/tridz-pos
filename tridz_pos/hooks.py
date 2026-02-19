app_name = "tridz_pos"
app_title = "Tridz Pos"
app_publisher = "Tridz"
app_description = "Tridz POS is a custom Point of Sale application built on the Frappe Framework, designed for efficient retail sales management, particularly in environments like small shops or minimarts. It integrates seamlessly with ERPNext for inventory, customer tracking, and financial syncing."
app_email = "tridz@gmail.com"
app_license = "mit"

# Apps
# ------------------

# required_apps = []

# Each item in the list will be shown as an app in the apps page
# add_to_apps_screen = [
# 	{
# 		"name": "tridz_pos",
# 		"logo": "/assets/tridz_pos/logo.png",
# 		"title": "Tridz Pos",
# 		"route": "/tridz_pos",
# 		"has_permission": "tridz_pos.api.permission.has_app_permission"
# 	}
# ]

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/tridz_pos/css/tridz_pos.css"
# app_include_js = "/assets/tridz_pos/js/tridz_pos.js"

# include js, css files in header of web template
# web_include_css = "/assets/tridz_pos/css/tridz_pos.css"
# web_include_js = "/assets/tridz_pos/js/tridz_pos.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "tridz_pos/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Svg Icons
# ------------------
# include app icons in desk
# app_include_icons = "tridz_pos/public/icons.svg"

# Home Pages
# ----------

# application home page (will override Website Settings)
home_page = "pos"

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

website_route_rules = [
    {"from_route": "/login", "to_route": "pos"},
]

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# automatically load and sync documents of this doctype from downstream apps
# importable_doctypes = [doctype_1]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "tridz_pos.utils.jinja_methods",
# 	"filters": "tridz_pos.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "tridz_pos.install.before_install"
# after_install = "tridz_pos.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "tridz_pos.uninstall.before_uninstall"
# after_uninstall = "tridz_pos.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "tridz_pos.utils.before_app_install"
# after_app_install = "tridz_pos.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "tridz_pos.utils.before_app_uninstall"
# after_app_uninstall = "tridz_pos.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "tridz_pos.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
# 	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"tridz_pos.tasks.all"
# 	],
# 	"daily": [
# 		"tridz_pos.tasks.daily"
# 	],
# 	"hourly": [
# 		"tridz_pos.tasks.hourly"
# 	],
# 	"weekly": [
# 		"tridz_pos.tasks.weekly"
# 	],
# 	"monthly": [
# 		"tridz_pos.tasks.monthly"
# 	],
# }

# Testing
# -------

# before_tests = "tridz_pos.install.before_tests"

# Extend DocType Class
# ------------------------------
#
# Specify custom mixins to extend the standard doctype controller.
# extend_doctype_class = {
# 	"Task": "tridz_pos.custom.task.CustomTaskMixin"
# }

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "tridz_pos.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "tridz_pos.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["tridz_pos.utils.before_request"]
# after_request = ["tridz_pos.utils.after_request"]

# Job Events
# ----------
# before_job = ["tridz_pos.utils.before_job"]
# after_job = ["tridz_pos.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"tridz_pos.auth.validate"
# ]

# Automatically update python controller files with type annotations for this app.
# export_python_type_annotations = True

# default_log_clearing_doctypes = {
# 	"Logging DocType Name": 30  # days to retain logs
# }

# Translation
# ------------
# List of apps whose translatable strings should be excluded from this app's translations.
# ignore_translatable_strings_from = []

