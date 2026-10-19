"""CPU-only linear regression. Run: python train_linear.py"""
import platform
import torch
from torch import nn

print('Python', platform.python_version(), 'PyTorch', torch.__version__)
torch.manual_seed(42)
x = torch.rand(160, 1) * 2
y = 2 * x + 1 + torch.randn_like(x) * 0.1
x_train, y_train = x[:128], y[:128]
x_valid, y_valid = x[128:], y[128:]
model = nn.Linear(1, 1)
with torch.no_grad():
    model.weight.fill_(1.0)
    model.bias.zero_()
loss_fn = nn.MSELoss()
optimizer = torch.optim.SGD(model.parameters(), lr=0.05)

def report(step):
    model.eval()
    with torch.no_grad():
        train_loss = loss_fn(model(x_train), y_train).item()
        valid_loss = loss_fn(model(x_valid), y_valid).item()
    print(f'{step:3d} train={train_loss:.6f} valid={valid_loss:.6f} '
          f'w={model.weight.item():.4f} b={model.bias.item():.4f}')

report(0)
for step in range(1, 201):
    model.train()
    prediction = model(x_train)
    loss = loss_fn(prediction, y_train)
    if not torch.isfinite(loss):
        raise RuntimeError('Loss is not finite. Reduce the learning rate.')
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()
    if step % 20 == 0:
        report(step)
