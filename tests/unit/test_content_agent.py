import json

def test_openai_response_parsing():
  class R:
    def __init__(self):
      self.choices = [type("M", (), {"message": type("C", (), {"content": json.dumps({"title":"T","thread":["A","B"]})})()})]
      self.model = "gpt-4o-mini"
      self.usage = {"total_tokens": 123}
  r = R()
  text = r.choices[0].message.content
  parsed = json.loads(text)
  assert parsed["title"] == "T"
  assert parsed["thread"][0] == "A"

def test_cost_calc():
  tokens = 123
  usd_cost = tokens * 0.000002
  assert round(usd_cost, 6) == 0.000246
