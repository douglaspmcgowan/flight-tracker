"""Unit tests for pure helper functions in main.py."""
from collections import namedtuple
from datetime import datetime
import unittest

from main import _fmt_clock, _to_dt, _total_duration

SimpleDatetime = namedtuple("SimpleDatetime", ["date", "time"])


class SegmentStub:
    def __init__(self, duration=0, arrival=None, departure=None):
        self.duration = duration
        self.arrival = arrival
        self.departure = departure


class TestToDt(unittest.TestCase):
    def test_to_dt_valid(self):
        sd = SimpleDatetime(date=[2026, 8, 27], time=[9, 5])
        self.assertEqual(_to_dt(sd), datetime(2026, 8, 27, 9, 5))

    def test_to_dt_single_element_time(self):
        sd = SimpleDatetime(date=[2026, 8, 27], time=[14])
        self.assertEqual(_to_dt(sd), datetime(2026, 8, 27, 14, 0))

    def test_to_dt_malformed_returns_none(self):
        self.assertIsNone(_to_dt(None))
        self.assertIsNone(_to_dt("invalid"))
        self.assertIsNone(_to_dt(SimpleDatetime(date=[2026, 2, 31], time=[9, 5])))
        self.assertIsNone(_to_dt(SimpleDatetime(date=[], time=[9, 5])))


class TestFmtClock(unittest.TestCase):
    def test_fmt_clock_strips_leading_zero(self):
        sd = SimpleDatetime(date=[2026, 8, 27], time=[9, 5])
        self.assertEqual(_fmt_clock(sd), "9:05 AM")

    def test_fmt_clock_preserves_double_digit_hour(self):
        sd = SimpleDatetime(date=[2026, 8, 27], time=[11, 5])
        self.assertEqual(_fmt_clock(sd), "11:05 AM")

    def test_fmt_clock_malformed_returns_none(self):
        self.assertIsNone(_fmt_clock(None))
        self.assertIsNone(_fmt_clock(SimpleDatetime(date="bad", time="bad")))


class TestTotalDuration(unittest.TestCase):
    def test_total_duration_single_segment(self):
        segs = [SegmentStub(duration=135)]
        self.assertEqual(_total_duration(segs), "2h 15m")

    def test_total_duration_sums_segments_and_positive_layover_gaps(self):
        seg1 = SegmentStub(
            duration=120,
            arrival=SimpleDatetime(date=[2026, 8, 27], time=[11, 0]),
            departure=SimpleDatetime(date=[2026, 8, 27], time=[9, 0]),
        )
        seg2 = SegmentStub(
            duration=90,
            arrival=SimpleDatetime(date=[2026, 8, 27], time=[14, 0]),
            departure=SimpleDatetime(date=[2026, 8, 27], time=[12, 30]),
        )
        # Layover between 11:00 AM and 12:30 PM is 90 minutes.
        # Total = 120 + 90 + 90 = 300 minutes -> 5h 0m
        self.assertEqual(_total_duration([seg1, seg2]), "5h 0m")

    def test_total_duration_non_positive_returns_none(self):
        self.assertIsNone(_total_duration([]))
        self.assertIsNone(_total_duration([SegmentStub(duration=0)]))
        self.assertIsNone(_total_duration([SegmentStub(duration=-15)]))

    def test_total_duration_malformed_input_returns_none(self):
        self.assertIsNone(_total_duration(None))
        self.assertIsNone(_total_duration("invalid"))


if __name__ == "__main__":
    unittest.main()
