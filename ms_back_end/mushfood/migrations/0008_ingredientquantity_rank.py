# Generated by Django 3.2.13 on 2023-03-21 14:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mushfood', '0007_auto_20230316_1359'),
    ]

    operations = [
        migrations.AddField(
            model_name='ingredientquantity',
            name='rank',
            field=models.PositiveIntegerField(default=0, help_text='Rank of the Ingredient in the recipe', verbose_name='ranks'),
        ),
    ]
