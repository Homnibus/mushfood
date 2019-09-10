from guardian.shortcuts import assign_perm

def assign_all_perm(model_instance, user):
  model_name = model_instance._meta.model_name
  assign_perm('change_{}'.format(model_name), user, model_instance)
  assign_perm('delete_{}'.format(model_name), user, model_instance)
