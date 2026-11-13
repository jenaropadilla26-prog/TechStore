import contextlib
import importlib
import io
import os
from html.parser import HTMLParser
from pathlib import Path
import sys
import types
import unittest
from unittest.mock import Mock, patch


PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))

boto3_stub = types.ModuleType("boto3")
boto3_stub.client = Mock()
with patch.dict(sys.modules, {"boto3": boto3_stub}):
    s3_menu = importlib.import_module("s3_Menu")


class SecurityRegressionTests(unittest.TestCase):
    owner_id = "123456789012"

    def setUp(self):
        self.s3 = Mock()
        s3_menu.s3 = self.s3

    def test_upload_supplies_expected_bucket_owner_as_extra_args(self):
        with patch.dict(
            os.environ, {"AWS_S3_EXPECTED_BUCKET_OWNER": self.owner_id}
        ):
            with patch("builtins.input", side_effect=["photo.jpg", "photo.jpg"]), patch(
                "s3_Menu.os.path.exists", return_value=True
            ), patch("builtins.print"):
                s3_menu.subir_archivo()

        self.s3.upload_file.assert_called_once_with(
            "photo.jpg",
            s3_menu.BUCKET_NAME,
            "photo.jpg",
            ExtraArgs={"ExpectedBucketOwner": self.owner_id},
        )

    def test_listing_supplies_expected_bucket_owner(self):
        self.s3.list_objects_v2.return_value = {}
        with patch.dict(os.environ, {"AWS_S3_EXPECTED_BUCKET_OWNER": self.owner_id}):
            with patch("builtins.print"):
                s3_menu.listar_archivos()

        self.s3.list_objects_v2.assert_called_once_with(
            Bucket=s3_menu.BUCKET_NAME,
            ExpectedBucketOwner=self.owner_id,
        )

    def test_download_supplies_expected_bucket_owner_as_extra_args(self):
        self.s3.list_objects_v2.return_value = {}
        with patch.dict(
            os.environ, {"AWS_S3_EXPECTED_BUCKET_OWNER": self.owner_id}
        ):
            with patch(
                "builtins.input", side_effect=["photo.jpg", "downloaded.jpg"]
            ), patch("builtins.print"):
                s3_menu.descargar_archivo()

        self.s3.download_file.assert_called_once_with(
            s3_menu.BUCKET_NAME,
            "photo.jpg",
            "downloaded.jpg",
            ExtraArgs={"ExpectedBucketOwner": self.owner_id},
        )

    def test_delete_supplies_expected_bucket_owner(self):
        self.s3.list_objects_v2.return_value = {}
        with patch.dict(
            os.environ, {"AWS_S3_EXPECTED_BUCKET_OWNER": self.owner_id}
        ):
            with patch("builtins.input", return_value="photo.jpg"), patch(
                "builtins.print"
            ):
                s3_menu.eliminar_archivo()

        self.s3.delete_object.assert_called_once_with(
            Bucket=s3_menu.BUCKET_NAME,
            Key="photo.jpg",
            ExpectedBucketOwner=self.owner_id,
        )

    def test_missing_or_invalid_owner_prevents_s3_requests(self):
        for owner in ("", "123", "12345678901x"):
            with self.subTest(owner=owner):
                self.s3.reset_mock()
                output = io.StringIO()
                with patch.dict(
                    os.environ, {"AWS_S3_EXPECTED_BUCKET_OWNER": owner}
                ):
                    with contextlib.redirect_stdout(output):
                        s3_menu.listar_archivos()

                self.s3.list_objects_v2.assert_not_called()
                self.assertIn("AWS_S3_EXPECTED_BUCKET_OWNER", output.getvalue())

    def test_file_picker_has_an_associated_accessible_label(self):
        class InputLabelParser(HTMLParser):
            def __init__(self):
                super().__init__()
                self.labels = []
                self.inputs = []

            def handle_starttag(self, tag, attrs):
                attributes = dict(attrs)
                if tag == "label":
                    self.labels.append(attributes)
                elif tag == "input":
                    self.inputs.append(attributes)

        parser = InputLabelParser()
        html_path = PROJECT_ROOT / "legacy" / "laboratorio_s3.html"
        parser.feed(html_path.read_text(encoding="utf-8"))

        file_input = next(
            element for element in parser.inputs if element.get("id") == "archivo"
        )
        self.assertEqual(file_input.get("type"), "file")
        self.assertNotIn("disabled", file_input)
        self.assertTrue(
            any(label.get("for") == file_input["id"] for label in parser.labels)
        )


if __name__ == "__main__":
    unittest.main()